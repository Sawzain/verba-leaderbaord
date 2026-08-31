const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Score = require("../Score");
const requireAuth = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiters");
const { signToken } = require("../utils/tokens");
const validate = require("../middleware/validate");
const { registerSchema, resetPasswordSchema } = require("../schemas/authSchemas");
const { setAuthCookies, clearAuthCookies } = require("../utils/authCookies");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../config/mailer");
const {
  REQUIRE_EMAIL_VERIFICATION,
  FRONTEND_REDIRECT,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  DISCORD_CONFIGURED,
} = require("../config/env");
const logger = require("../utils/logger");

const router = express.Router();

// In-memory store for short-lived, single-use Discord OAuth exchange
// codes. Needed because of a real browser behavior, not a hypothetical:
// Firefox's Total Cookie Protection (and similar per-site storage
// partitioning in other browsers) stores a cookie set while
// onrender.com is the top-level page — which briefly happens during the
// OAuth redirect chain below — in a DIFFERENT partition than one set via
// a cross-site fetch made from the Vercel frontend. So a cookie set
// directly on this callback's redirect is invisible to the frontend's
// later apiFetch calls, even though the exact same cookie set via a
// normal login POST works fine. Instead, this route hands the frontend
// a short-lived code; the frontend redeems it via its own fetch (POST
// /discord/exchange, called from Vercel like any other request), which
// sets the cookie in the correct, consistently-readable partition.
//
// A single Render instance's memory is fine for this app's scale. If
// this ever runs on multiple instances behind a load balancer, move
// this to a shared store (Mongo, Redis) — an in-memory Map isn't
// visible across instances.
const pendingDiscordExchanges = new Map();
const EXCHANGE_CODE_TTL_MS = 60 * 1000;

function pruneExpiredExchanges() {
  const now = Date.now();
  for (const [code, entry] of pendingDiscordExchanges) {
    if (entry.expiresAt < now) pendingDiscordExchanges.delete(code);
  }
}

// ===================== Member accounts (for reviews) =====================
// Separate from the admin x-api-key: this is a real login so a review is
// always tied to one specific person, not just whatever name they typed.

router.post("/register", authLimiter, validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with that email already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(24).toString("hex");
    const user = await User.create({
      name,
      email,
      passwordHash,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    sendVerificationEmail(user, verificationToken).catch(() => {});

    setAuthCookies(res, signToken(user));
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl || "",
        requireEmailVerification: REQUIRE_EMAIL_VERIFICATION,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Couldn't create the account" });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ error: "Invalid email or password" });

    setAuthCookies(res, signToken(user));
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl || "",
        requireEmailVerification: REQUIRE_EMAIL_VERIFICATION,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Couldn't log in" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    // Rolling refresh: every successful /me call re-issues a fresh
    // 7-day cookie, so an active user effectively never gets logged out
    // mid-use, while an abandoned/stolen session still dies within a
    // week of its last real use rather than lasting a full 7 days from
    // login regardless of activity.
    setAuthCookies(res, signToken(user));
    res.json({
      id: req.userId,
      name: req.userName,
      email: user?.email || "",
      isAdmin: Boolean(user?.isAdmin),
      emailVerified: Boolean(user?.emailVerified),
      avatarUrl: user?.avatarUrl || "",
      requireEmailVerification: REQUIRE_EMAIL_VERIFICATION,
    });
  } catch (err) {
    res.json({
      id: req.userId,
      name: req.userName,
      email: "",
      isAdmin: req.userIsAdmin || false,
      emailVerified: false,
      requireEmailVerification: REQUIRE_EMAIL_VERIFICATION,
    });
  }
});

// GET: click-through link from the verification email. Not behind
// requireAuth since the person may be opening it in a different browser/
// device than the one they registered on.
router.get("/verify", async (req, res) => {
  const token = req.query.token;
  if (!token)
    return res.redirect(`${FRONTEND_REDIRECT}/app/reviews?emailVerified=0`);

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.redirect(
        `${FRONTEND_REDIRECT}/app/reviews?emailVerified=expired`,
      );
    }
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    res.redirect(`${FRONTEND_REDIRECT}/app/reviews?emailVerified=1`);
  } catch (err) {
    res.redirect(`${FRONTEND_REDIRECT}/app/reviews?emailVerified=0`);
  }
});

// POST: resend the verification email to the logged-in user's own address.
router.post(
  "/resend-verification",
  requireAuth,
  authLimiter,
  async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user || !user.email) {
        return res.status(400).json({ error: "No email on this account" });
      }
      if (user.emailVerified) {
        return res.json({ ok: true, alreadyVerified: true });
      }
      user.verificationToken = crypto.randomBytes(24).toString("hex");
      user.verificationTokenExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      );
      await user.save();
      await sendVerificationEmail(user, user.verificationToken);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: "Couldn't resend the verification email" });
    }
  },
);

// ===================== Self-service password reset =====================
// Security properties, deliberately:
// - The reset token is 256 bits of randomness (crypto.randomBytes(32)).
// - Only its SHA-256 hash is ever stored — a leaked database can't be
//   used to reset anyone's password, same reasoning as hashing passwords.
// - Tokens expire in 1 hour and are cleared the moment they're used, so
//   each one is single-use.
// - The request-reset endpoint ALWAYS returns the same generic response,
//   whether or not that email has an account. Varying the response (or
//   even the response time in a way that's easy to notice) would let an
//   attacker enumerate registered emails one guess at a time.

router.post("/forgot-password", authLimiter, async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();

  const genericResponse = {
    ok: true,
    message:
      "If an account exists for that email, we've sent a link to reset the password.",
  };

  if (!email) return res.json(genericResponse);

  try {
    const user = await User.findOne({ email });
    // Discord-only accounts have no passwordHash — there's no password to
    // reset, so skip token generation for those rather than send a
    // confusing "reset your password" email to a Discord-only member.
    if (user && user.passwordHash) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      user.resetPasswordTokenHash = tokenHash;
      user.resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      sendPasswordResetEmail(user, rawToken).catch(() => {});
    }
  } catch (err) {
    // Deliberately swallowed — the response must not vary based on what,
    // if anything, went wrong internally.
  }

  res.json(genericResponse);
});

router.post("/reset-password", authLimiter, validate(resetPasswordSchema), async (req, res) => {
  const { token, password } = req.body;

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "This reset link is invalid or has expired." });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    // Clearing these makes the token single-use — a second attempt with
    // the same link, even before expiry, will fail the lookup above.
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Couldn't reset your password" });
  }
});

// ===================== Discord login =====================
// Lets a member sign in with their Discord identity instead of creating a
// separate email/password account — Verba already lives on Discord, so
// this is a more native fit than a brand-new signup flow. Only active if
// all three Discord env vars are set; otherwise these routes explain what's
// missing instead of failing mysteriously.

router.get("/discord", (req, res) => {
  if (!DISCORD_CONFIGURED) {
    return res
      .status(503)
      .send(
        "Discord login isn't configured on this server yet. Set DISCORD_CLIENT_ID, " +
          "DISCORD_CLIENT_SECRET, and DISCORD_REDIRECT_URI.",
      );
  }
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify email",
    prompt: "consent",
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
});

router.get("/discord/callback", async (req, res) => {
  if (!DISCORD_CONFIGURED) {
    return res.redirect(
      `${FRONTEND_REDIRECT}?authError=discord_not_configured`,
    );
  }
  const code = req.query.code;
  if (!code) {
    return res.redirect(`${FRONTEND_REDIRECT}?authError=discord`);
  }

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });
    if (!tokenRes.ok) throw new Error("Discord token exchange failed");
    const tokenBody = await tokenRes.json();

    const profileRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    });
    if (!profileRes.ok) throw new Error("Discord profile fetch failed");
    const profile = await profileRes.json();

    const discordId = profile.id;
    const name = profile.global_name || profile.username || "Discord member";
    const email = profile.email ? profile.email.trim().toLowerCase() : "";
    // Discord's CDN needs the hash extension to differ for animated
    // avatars (a_-prefixed hash = gif), otherwise a static png request
    // for an animated avatar just 404s.
    const avatarUrl = profile.avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${profile.avatar}.${
          profile.avatar.startsWith("a_") ? "gif" : "png"
        }`
      : "";

    let user = await User.findOne({ discordId });
    if (!user && email) {
      user = await User.findOne({ email });
    }
    if (!user) {
      user = new User({ name, discordId, emailVerified: true, avatarUrl });
      if (email) user.email = email;
    } else {
      user.discordId = discordId;
      user.name = name;
      user.emailVerified = true;
      if (avatarUrl) user.avatarUrl = avatarUrl;
    }
    await user.save();

    // Auto-link: if there's a leaderboard entry with this exact name (case-
    // insensitive) that isn't linked to anyone yet, connect it to this
    // account automatically — saves an admin from doing it by hand for the
    // common case of an exact name match. Anything that doesn't match
    // exactly still needs the manual "Link Discord account" flow in Manage.
    if (!(await Score.findOne({ userId: user._id }))) {
      const escaped = user.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      await Score.updateOne(
        {
          username: new RegExp(`^${escaped}$`, "i"),
          userId: { $in: [null, undefined] },
        },
        { userId: user._id },
      );
    }

    const jwtToken = signToken(user);
    const exchangeCode = crypto.randomBytes(24).toString("hex");
    pruneExpiredExchanges();
    pendingDiscordExchanges.set(exchangeCode, {
      token: jwtToken,
      expiresAt: Date.now() + EXCHANGE_CODE_TTL_MS,
    });
    // No ?token= in the URL — this code is short-lived and single-use,
    // and on its own grants nothing without being redeemed at
    // /discord/exchange within the next 60 seconds.
    res.redirect(`${FRONTEND_REDIRECT}?discordExchange=${exchangeCode}`);
  } catch (err) {
    logger.error("Discord auth failed", err);
    res.redirect(`${FRONTEND_REDIRECT}?authError=discord`);
  }
});

// POST: completes Discord login. See the comment on
// pendingDiscordExchanges above for why this extra round-trip exists —
// this is the fetch that actually sets a cookie the frontend can read.
router.post("/discord/exchange", (req, res) => {
  pruneExpiredExchanges();
  const code = req.body?.code;
  const entry = code ? pendingDiscordExchanges.get(code) : null;
  if (!entry) {
    return res.status(400).json({
      error: "This login link has expired. Please try logging in again.",
    });
  }
  pendingDiscordExchanges.delete(code); // single-use
  setAuthCookies(res, entry.token);
  res.json({ ok: true });
});

// POST: clear the session. Didn't need to exist before this migration —
// logging out used to just mean forgetting the token in localStorage,
// nothing server-side to undo. An httpOnly cookie can only be cleared by
// a server response, so this route is now required for logout to work
// at all.
router.post("/logout", (req, res) => {
  clearAuthCookies(res);
  res.json({ ok: true });
});

module.exports = router;
