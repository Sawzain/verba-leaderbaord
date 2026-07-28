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

function requireApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (key !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

const requireAuth = require("./middleware/auth");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

const Score = require("./Score");
const User = require("./models/User");
const Book = require("./models/Book");
const Review = require("./models/Review");

// --- Book cover uploads ---
const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP, or GIF images are allowed"));
    }
    cb(null, true);
  },
});

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), name: user.name }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
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

// GET: Verify an admin key without doing anything mutating.
// The frontend uses this to show a clear "unlocked" state instead of
// only finding out the key is wrong after a failed add/edit/delete.
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
      user: { id: user._id, name: user.name, email: user.email },
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
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Couldn't log in" });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ id: req.userId, name: req.userName });
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
    const book = await Book.create({
      title,
      author,
      coverImage: req.file ? `/uploads/${req.file.filename}` : "",
    });
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
      fs.unlink(path.join(uploadsDir, path.basename(book.coverImage)), () => {});
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ error: "Invalid book id" });
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

// DELETE: remove a review (admin only) — e.g. for abusive or off-topic reviews
app.delete("/api/reviews/:id", requireApiKey, async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Review not found" });
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
