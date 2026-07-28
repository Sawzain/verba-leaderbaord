require("dotenv").config();
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const sharp = require("sharp");
const { v2: cloudinary } = require("cloudinary");

const app = express();

// Trust Render's proxy so rate limiting keys off the real client IP,
// not the proxy's.
app.set("trust proxy", 1);

const allowedOrigin = process.env.FRONTEND_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));
app.use(express.json());

if (!process.env.MONGO_URI) {
  console.error(
    "Missing MONGO_URI environment variable. Copy .env.example to .env and fill in your connection string.",
  );
  process.exit(1);
}
if (!process.env.API_KEY) {
  console.error(
    "Missing API_KEY environment variable. Generate one with: openssl rand -hex 24",
  );
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error(
    "Missing JWT_SECRET environment variable. Generate one with: openssl rand -hex 32",
  );
  process.exit(1);
}
if (!process.env.CLOUDINARY_URL) {
  console.error(
    "Missing CLOUDINARY_URL environment variable. Render's disk is ephemeral, so " +
      "book covers are stored on Cloudinary instead. Get a free account at " +
      "cloudinary.com, then copy the 'API Environment variable' (starts with " +
      "cloudinary://...) from your dashboard into CLOUDINARY_URL.",
  );
  process.exit(1);
}
// cloudinary.config() picks up CLOUDINARY_URL from the environment
// automatically, but calling it explicitly makes that dependency obvious
// here instead of implicit magic.
cloudinary.config({ secure: true });

function requireApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (key === process.env.API_KEY) {
    return next();
  }
  // Fall back to an individual admin account (Bearer token, isAdmin: true)
  // so the shared key doesn't have to be handed out to every admin.
  return requireAdminAccount(req, res, next);
}

const requireAuth = require("./middleware/auth");
const { requireAdminAccount } = require("./middleware/auth");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

const Score = require("./Score");
const User = require("./models/User");
const Book = require("./models/Book");
const Review = require("./models/Review");

// --- Book cover uploads ---
// Covers live on Cloudinary, not Render's disk. Render's free tier disk is
// ephemeral — anything written to it disappears on the next deploy or
// restart — so storing covers locally meant they'd vanish unpredictably.
// This directory is kept only so any covers uploaded *before* this
// migration (still pointing at "/uploads/xxx.jpg") keep working until
// they're naturally replaced.
const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use(
  "/uploads",
  express.static(uploadsDir, { maxAge: "7d", immutable: true }),
);

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP, or GIF images are allowed"));
    }
    cb(null, true);
  },
});

// Cover photos are often straight off a phone camera (several MB, wrong
// orientation baked into EXIF instead of pixels). This resizes to a
// sensible display width and re-encodes as compressed JPEG, then uploads
// the result to Cloudinary, which is where the file actually lives
// permanently. Returns the public URL and the public_id (needed later to
// delete the asset when the book is removed).
async function saveCoverImage(fileBuffer) {
  const processed = await sharp(fileBuffer)
    .rotate() // apply EXIF orientation, then strip it
    .resize({ width: 600, withoutEnlargement: true })
    .jpeg({ quality: 78 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "verba-covers", resource_type: "image", format: "jpg" },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(processed);
  });
}

// Best-effort cleanup for a book's cover — handles both a Cloudinary asset
// (current) and a legacy local file (pre-migration), without throwing if
// either is already gone.
function deleteCoverAssets(book) {
  if (book.coverPublicId) {
    cloudinary.uploader.destroy(book.coverPublicId).catch(() => {});
  } else if (book.coverImage && book.coverImage.startsWith("/uploads/")) {
    fs.unlink(path.join(uploadsDir, path.basename(book.coverImage)), () => {});
  }
}

// ===================== Leaderboard points for reviews =====================
// The Leaderboard (Score model) and Books/Reviews (User model) are two
// separate systems that predate each other — Score entries are just a
// username string, not linked to a User account. To connect them without a
// bigger migration, a review's points are credited to the Score entry whose
// username matches the reviewer's account name (case-insensitively). If no
// matching Score entry exists yet, one is created.
// Points-per-review used to auto-credit the Score/leaderboard entry that
// matches a reviewer's account name. Turned OFF by default (see
// AUTO_AWARD_REVIEW_POINTS below) — with review volume still low, matching
// by name string was creating duplicate leaderboard entries whenever a
// review-login name didn't exactly match how someone was already listed on
// the leaderboard (e.g. "Sajen Malakar" vs "Sajen"). Points are managed by
// hand in Manage instead for now. Set AUTO_AWARD_REVIEW_POINTS=true to turn
// this back on once accounts and leaderboard names are fully unified.
const REVIEW_POINTS = Number(process.env.REVIEW_POINTS) || 10;
const AUTO_AWARD_REVIEW_POINTS = process.env.AUTO_AWARD_REVIEW_POINTS === "true";

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function awardReviewPoints(username) {
  if (!AUTO_AWARD_REVIEW_POINTS) return;
  const name = (username || "").trim();
  if (!name) return;
  const match = new RegExp(`^${escapeRegex(name)}$`, "i");
  const score = await Score.findOne({ username: match });
  if (score) {
    score.score = (score.score || 0) + REVIEW_POINTS;
    await score.save();
  } else {
    await Score.create({ username: name, score: REVIEW_POINTS });
  }
}

// Called when a review is removed, so deleting or editing away a review
// doesn't leave stale points on the leaderboard.
async function revokeReviewPoints(username) {
  if (!AUTO_AWARD_REVIEW_POINTS) return;
  const name = (username || "").trim();
  if (!name) return;
  const match = new RegExp(`^${escapeRegex(name)}$`, "i");
  const score = await Score.findOne({ username: match });
  if (score) {
    score.score = Math.max(0, (score.score || 0) - REVIEW_POINTS);
    await score.save();
  }
}

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), name: user.name, isAdmin: Boolean(user.isAdmin) },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );
}

// Slows down brute-force login/register attempts against a single account
// or from a single client, without needing a captcha or external service.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait a few minutes and try again." },
});

// GET: Verify admin access — works with either the legacy shared x-api-key
// or a logged-in admin account's Bearer token (requireApiKey checks both).
// The frontend uses this to show a clear "unlocked" state instead of
// only finding out after a failed add/edit/delete.
app.get("/api/admin/verify", requireApiKey, (req, res) => {
  res.json({ ok: true });
});

// GET: Fetch all members (using Score model)
app.get("/api/members", async (req, res) => {
  try {
    const scores = await Score.find();
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// POST: Add a new member (using Score model)
app.post("/api/members", requireApiKey, async (req, res) => {
  const username = (req.body.username || "").trim();
  const score = Number(req.body.score) || 0;

  if (!username) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const newEntry = new Score({ username, score });
    await newEntry.save();
    res.json(newEntry);
  } catch (err) {
    res.status(500).json({ error: "Failed to add entry" });
  }
});

// DELETE: Remove by id
app.delete("/api/members/:id", requireApiKey, async (req, res) => {
  try {
    const deleted = await Score.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ error: "Invalid member id" });
  }
});

// PUT: Update score (and optionally name) by id
app.put("/api/members/:id", requireApiKey, async (req, res) => {
  try {
    const update = {};
    if (req.body.score !== undefined) update.score = req.body.score;
    if (req.body.username !== undefined) update.username = req.body.username;

    const updated = await Score.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Invalid member id" });
  }
});

// ===================== Member accounts (for reviews) =====================
// Separate from the admin x-api-key: this is a real login so a review is
// always tied to one specific person, not just whatever name they typed.

app.post("/api/auth/register", authLimiter, async (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (err) {
    res.status(500).json({ error: "Couldn't create the account" });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (err) {
    res.status(500).json({ error: "Couldn't log in" });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    res.json({ id: req.userId, name: req.userName, email: user?.email || "", isAdmin: Boolean(user?.isAdmin) });
  } catch (err) {
    res.json({ id: req.userId, name: req.userName, email: "", isAdmin: req.userIsAdmin || false });
  }
});

// ===================== Discord login =====================
// Lets a member sign in with their Discord identity instead of creating a
// separate email/password account — Verba already lives on Discord, so
// this is a more native fit than a brand-new signup flow. Only active if
// all three Discord env vars are set; otherwise these routes explain what's
// missing instead of failing mysteriously.
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const discordConfigured = Boolean(
  DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET && DISCORD_REDIRECT_URI,
);
// Where to send the browser back to after the OAuth round trip completes.
const FRONTEND_REDIRECT = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.get("/api/auth/discord", (req, res) => {
  if (!discordConfigured) {
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

app.get("/api/auth/discord/callback", async (req, res) => {
  if (!discordConfigured) {
    return res.redirect(`${FRONTEND_REDIRECT}?authError=discord_not_configured`);
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

    let user = await User.findOne({ discordId });
    if (!user && email) {
      // If a password account already exists with this email, link Discord
      // to it instead of creating a duplicate person.
      user = await User.findOne({ email });
    }
    if (!user) {
      user = new User({ name, discordId });
      if (email) user.email = email;
    } else {
      user.discordId = discordId;
      user.name = name;
    }
    await user.save();

    const jwtToken = signToken(user);
    res.redirect(`${FRONTEND_REDIRECT}?token=${encodeURIComponent(jwtToken)}`);
  } catch (err) {
    console.error("Discord auth failed", err);
    res.redirect(`${FRONTEND_REDIRECT}?authError=discord`);
  }
});

// POST: admin-assisted password reset. There's no email service configured,
// so this doesn't send anything automatically — it generates a fresh
// temporary password and hands it back to the admin, who relays it to the
// member out of band (Discord DM, in person, etc). The member can't request
// this themselves; it requires the admin x-api-key.
app.post("/api/admin/reset-password", requireApiKey, async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No account found with that email" });
    }

    const tempPassword = crypto.randomBytes(6).toString("hex"); // 12 chars
    user.passwordHash = await bcrypt.hash(tempPassword, 10);
    await user.save();

    res.json({ email: user.email, name: user.name, tempPassword });
  } catch (err) {
    res.status(500).json({ error: "Couldn't reset that password" });
  }
});

// ============================== Books ==============================

// GET: all books, each with an average rating and review count
app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.find().sort({ addedAt: -1 }).lean();
    const summaries = await Review.aggregate([
      { $group: { _id: "$book", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const summaryById = new Map(summaries.map((s) => [s._id.toString(), s]));

    res.json(
      books.map((b) => {
        const s = summaryById.get(b._id.toString());
        return {
          ...b,
          avgRating: s ? Math.round(s.avgRating * 10) / 10 : null,
          reviewCount: s ? s.count : 0,
        };
      }),
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// GET: one book with its full review list
app.get("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ error: "Book not found" });

    const reviews = await Review.find({ book: book._id })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      ...book,
      reviews: reviews.map((r) => ({
        id: r._id,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
        reviewer: r.user?.name || "Former member",
        userId: r.user?._id?.toString() || null,
      })),
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid book id" });
  }
});

// POST: add a book (admin only), with an optional cover image upload
app.post("/api/books", requireApiKey, upload.single("cover"), async (req, res) => {
  const title = (req.body.title || "").trim();
  const author = (req.body.author || "").trim();

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    let coverImage = "";
    let coverPublicId = "";
    if (req.file) {
      const uploaded = await saveCoverImage(req.file.buffer);
      coverImage = uploaded.url;
      coverPublicId = uploaded.publicId;
    }
    const book = await Book.create({ title, author, coverImage, coverPublicId });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: "Failed to add book" });
  }
});

// DELETE: remove a book (admin only) — also clears its reviews and cover file
app.delete("/api/books/:id", requireApiKey, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    await Review.deleteMany({ book: book._id });
    if (book.coverImage) {
      deleteCoverAssets(book);
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ error: "Invalid book id" });
  }
});

// PATCH: toggle a book's "current pick" status (admin only). Setting a
// book as the current pick clears the flag on every other book first, so
// exactly one (or zero) books can ever be the current pick. Calling this
// again on the book that's already the current pick unsets it.
app.patch("/api/books/:id/current-pick", requireApiKey, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    const makeCurrent = !book.isCurrentPick;
    if (makeCurrent) {
      await Book.updateMany(
        { _id: { $ne: book._id } },
        { isCurrentPick: false },
      );
    }
    book.isCurrentPick = makeCurrent;
    await book.save();
    res.json({ isCurrentPick: book.isCurrentPick });
  } catch (err) {
    res.status(400).json({ error: "Couldn't update the current pick" });
  }
});

// ============================== Reviews ==============================

// POST: add a review — requires a logged-in member.
// The one-review-per-person rule is enforced by the unique (book, user)
// index on Review, so this is safe even against duplicate/concurrent
// submissions, not just a check done in this handler.
app.post("/api/books/:id/reviews", requireAuth, async (req, res) => {
  const rating = Number(req.body.rating);
  const text = (req.body.text || "").trim();

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    const review = await Review.create({
      book: book._id,
      user: req.userId,
      rating,
      text,
    });

    await awardReviewPoints(req.userName);

    res.json({
      id: review._id,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
      reviewer: req.userName,
      userId: req.userId,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "You've already reviewed this book" });
    }
    res.status(400).json({ error: "Invalid book id" });
  }
});

// Authorizes either the admin (x-api-key) or the review's own author
// (Bearer token) to edit/remove a review — a member manages their own
// review, an admin can still step in for abusive or off-topic ones.
function authorizeReviewOwnerOrAdmin(req, res, next) {
  const key = req.headers["x-api-key"];
  if (key && key === process.env.API_KEY) {
    req.isAdmin = true;
    return next();
  }

  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Log in to do that" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    req.userName = payload.name;
    req.isAdmin = Boolean(payload.isAdmin);
    next();
  } catch (err) {
    res.status(401).json({ error: "Your session expired. Please log in again." });
  }
}

// PUT: edit a review — the review's own author, or an admin
app.put("/api/reviews/:id", authorizeReviewOwnerOrAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate("user", "name");
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (!req.isAdmin && review.user._id.toString() !== req.userId) {
      return res.status(403).json({ error: "You can only edit your own review" });
    }

    if (req.body.rating !== undefined) {
      const rating = Number(req.body.rating);
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
      review.rating = rating;
    }
    if (req.body.text !== undefined) {
      review.text = String(req.body.text).trim();
    }
    await review.save();

    res.json({
      id: review._id,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
      reviewer: review.user?.name || "Former member",
      userId: review.user?._id?.toString() || null,
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid review id" });
  }
});

// DELETE: remove a review — the review's own author, or an admin
// (e.g. for abusive or off-topic reviews)
app.delete("/api/reviews/:id", authorizeReviewOwnerOrAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate("user", "name");
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (!req.isAdmin && review.user._id.toString() !== req.userId) {
      return res.status(403).json({ error: "You can only remove your own review" });
    }

    const reviewerName = review.user?.name;
    await review.deleteOne();
    if (reviewerName) await revokeReviewPoints(reviewerName);

    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ error: "Invalid review id" });
  }
});

// Turns multer/upload errors (bad file type, too large) into clean JSON
// instead of Express's default HTML error page.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Image must be under 5MB" : err.message;
    return res.status(400).json({ error: message });
  }
  if (err && err.message && err.message.includes("images are allowed")) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
