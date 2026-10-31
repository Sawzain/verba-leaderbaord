// Runs on Vercel so the Discord token exchange leaves from Vercel's IP,
// not Render's (Render's shared IP is currently banned by Discord).
import crypto from "node:crypto";

// Constant-time comparison of the state cookie against the state Discord
// echoed back in the query string.
function statesMatch(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (!a || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export default async function handler(req, res) {
  const code = req.query?.code;

  // Login CSRF protection: the state must match the cookie set by
  // /api/discord-login in this same browser. Checked before any call to
  // Discord, and the cookie is cleared either way (single use).
  const cookieState = (req.headers.cookie || "")
    .split("; ")
    .find((c) => c.startsWith("verba_oauth_state="))
    ?.slice("verba_oauth_state=".length);
  res.setHeader(
    "Set-Cookie",
    "verba_oauth_state=; Max-Age=0; Path=/api; HttpOnly; Secure; SameSite=Lax",
  );
  if (!statesMatch(cookieState, req.query?.state)) {
    console.warn("Discord callback rejected: state missing or mismatched");
    res.writeHead(302, { Location: "/?authError=discord" });
    return res.end();
  }
  if (!code) {
    res.writeHead(302, { Location: "/?authError=discord" });
    return res.end();
  }

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    });
    const tokenBody = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Discord token exchange failed", tokenRes.status, JSON.stringify(tokenBody));
      const err = tokenRes.status === 429 ? "discord_rate_limited" : "discord";
      res.writeHead(302, { Location: `/?authError=${err}` });
      return res.end();
    }

    const profileRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    });
    if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.status}`);
    const profile = await profileRes.json();

    // Membership gate: only people who are in the Discord server can
    // log in. 404 means "not a member"; any other failure is treated as
    // an error rather than letting the person through.
    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${profile.id}`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } },
    );
    if (memberRes.status === 404) {
      console.log("Blocked login: not in server", profile.id);
      res.writeHead(302, { Location: "/?authError=not_in_server" });
      return res.end();
    }
    if (!memberRes.ok) {
      throw new Error(`Guild member check failed: ${memberRes.status}`);
    }
    const guildMember = await memberRes.json().catch(() => ({}));
    const adminRoleId = process.env.DISCORD_ADMIN_ROLE_ID;
    const isAdminRole = Boolean(
      adminRoleId && guildMember.roles?.includes(adminRoleId),
    );

    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/auth/discord/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bridge-secret": process.env.DISCORD_BRIDGE_SECRET,
        },
        body: JSON.stringify({ profile, isAdminRole }),
      },
    );
    const backendBody = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok || !backendBody.code) {
      throw new Error(`Backend complete failed: ${backendRes.status}`);
    }

    res.writeHead(302, { Location: `/?discordExchange=${backendBody.code}` });
    return res.end();
  } catch (err) {
    console.error("discord-callback failed:", err);
    res.writeHead(302, { Location: "/?authError=discord" });
    return res.end();
  }
}
