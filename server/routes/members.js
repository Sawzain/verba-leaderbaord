const express = require("express");
const Score = require("../Score");
const requireApiKey = require("../middleware/apiKey");
const requireAuth = require("../middleware/requireAuth");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const Book = require("../models/Book");
const Review = require("../models/Review");
const GENRES = require("../config/genres");

const router = express.Router();

// GET: Fetch all members, each enriched with their most recent activity
// (book finished or review written) so the leaderboard can show a small
// line of "what they've been up to" under their name.
router.get("/", async (req, res) => {
  try {
    const scores = await Score.find();

    const latestByScore = await ActivityLog.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$scoreId", doc: { $first: "$$ROOT" } } },
    ]);

    const bookIds = latestByScore.map((e) => e.doc.bookId).filter(Boolean);
    const books = await Book.find({ _id: { $in: bookIds } }, "title").lean();
    const bookTitleById = new Map(books.map((b) => [String(b._id), b.title]));

    const activityByScoreId = new Map(
      latestByScore.map((e) => [
        String(e._id),
        {
          type: e.doc.type,
          bookTitle: bookTitleById.get(String(e.doc.bookId)) || null,
        },
      ]),
    );

    const enriched = scores.map((s) => {
      const obj = s.toObject();
      obj.latestActivity = activityByScoreId.get(String(s._id)) || null;
      return obj;
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// POST: Add a new member
router.post("/", requireApiKey, async (req, res) => {
  const username = (req.body.username || "").trim();
  const score = Number(req.body.score) || 0;

  if (!username) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    // Case-insensitive duplicate check — leaderboard names are added
    // manually by an admin, so this is the only guard against "Sam" and
    // "sam" (or "Sam ") ending up as two separate entries.
    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await Score.findOne({
      username: new RegExp(`^${escaped}$`, "i"),
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: `"${username}" is already on the leaderboard` });
    }

    const newEntry = new Score({ username, score });
    await newEntry.save();
    res.json(newEntry);
  } catch (err) {
    console.error("POST /api/members failed:", err);
    res.status(500).json({ error: "Failed to add entry" });
  }
});

// DELETE: Remove by id
router.delete("/:id", requireApiKey, async (req, res) => {
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
router.post("/:id/mark-read", requireApiKey, async (req, res) => {
  const score = await Score.findById(req.params.id);
  if (!score) return res.status(404).json({ error: "Member not found" });

  const already = await ActivityLog.findOne({
    scoreId: score._id,
    bookId: req.body.bookId,
    type: "book_read",
  });
  if (already) {
    return res
      .status(409)
      .json({ error: "Already marked as read for this member" });
  }

  score.score = (score.score || 0) + 1;
  await score.save();
  await ActivityLog.create({
    scoreId: score._id,
    type: "book_read",
    bookId: req.body.bookId,
  });
  res.json(score);
});

router.post("/:id/link", requireApiKey, async (req, res) => {
  const score = await Score.findByIdAndUpdate(
    req.params.id,
    { userId: req.body.userId },
    { new: true },
  );
  if (!score) return res.status(404).json({ error: "Member not found" });
  res.json(score);
});

router.get("/unlinked-users", requireApiKey, async (req, res) => {
  const linkedIds = await Score.find({ userId: { $ne: null } }).distinct(
    "userId",
  );
  const users = await User.find(
    { discordId: { $ne: null }, _id: { $nin: linkedIds } },
    "name discordId",
  );
  res.json(users);
});

// GET: the fixed list of selectable genre tags, so the client doesn't
// hardcode a copy that can drift from server/config/genres.js.
router.get("/genres", (req, res) => {
  res.json(GENRES);
});

// GET: count of distinct books the club has collectively finished
// (not total points — 10 people reading the same book counts as 1).
router.get("/stats", async (req, res) => {
  const distinctBooks = await ActivityLog.distinct("bookId", {
    type: "book_read",
    bookId: { $ne: null },
  });
  res.json({ booksRead: distinctBooks.length });
});
// PUT: Update score (and optionally name) by id
router.put("/:id", requireApiKey, async (req, res) => {
  try {
    const current = await Score.findById(req.params.id);
    if (!current) {
      return res.status(404).json({ error: "Member not found" });
    }

    const update = {};
    if (req.body.score !== undefined) update.score = req.body.score;
    if (req.body.username !== undefined) update.username = req.body.username;

    // If this update is lowering the score (the "−" button), also remove
    // the most recent book_read activity entry, so the "already read"
    // block on the + button clears in sync with the point being undone.
    if (
      req.body.score !== undefined &&
      Number(req.body.score) < current.score
    ) {
      const lastRead = await ActivityLog.findOne({
        scoreId: current._id,
        type: "book_read",
      }).sort({ createdAt: -1 });
      if (lastRead) {
        await ActivityLog.deleteOne({ _id: lastRead._id });
      }
    }

    const updated = await Score.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Invalid member id" });
  }
});

// GET: a single member's public profile. If they've linked a Discord
// account, also include their bio, favorite genres, and reviews — those
// live on the User account, not the Score entry itself, so they're only
// available once the two are connected (see the decision in this
// session: unlinked members get stats-only, no reviews/bio/genres).
router.get("/:id/profile", async (req, res) => {
  try {
    const score = await Score.findById(req.params.id);
    if (!score) return res.status(404).json({ error: "Member not found" });

    const base = {
      id: score._id,
      name: score.username,
      points: score.score,
      memberSince: score.date,
      linked: Boolean(score.userId),
    };

    if (!score.userId) {
      return res.json(base);
    }

    const user = await User.findById(score.userId, "bio favoriteGenres");
    const reviews = await Review.find({ user: score.userId })
      .populate("book", "title")
      .sort({ createdAt: -1 });

    res.json({
      ...base,
      // Exposed so the client can compare against auth.user.id and decide
      // whether to show the edit form — not sensitive, already used for
      // the admin /link route.
      userId: score.userId,
      bio: user?.bio || "",
      favoriteGenres: user?.favoriteGenres || [],
      reviews: reviews.map((r) => ({
        id: r._id,
        bookTitle: r.book?.title || "a book",
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
      })),
      // Discord role tiers aren't wired up yet — placeholder until the
      // Twig-side Supabase sync exists.
      discordRoles: null,
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid member id" });
  }
});

// PUT: update your own bio/favorite genres. Self-only — the logged-in
// account must be the same User linked to this Score entry.
router.put("/:id/profile", requireAuth, async (req, res) => {
  try {
    const score = await Score.findById(req.params.id);
    if (!score) return res.status(404).json({ error: "Member not found" });
    if (!score.userId || score.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own profile" });
    }

    const update = {};
    if (req.body.bio !== undefined) {
      update.bio = String(req.body.bio).trim().slice(0, 200);
    }
    if (req.body.favoriteGenres !== undefined) {
      const genres = Array.isArray(req.body.favoriteGenres)
        ? req.body.favoriteGenres
        : [];
      update.favoriteGenres = genres.filter((g) => GENRES.includes(g));
    }

    const updated = await User.findByIdAndUpdate(score.userId, update, {
      new: true,
    });
    res.json({
      bio: updated.bio,
      favoriteGenres: updated.favoriteGenres,
    });
  } catch (err) {
    res.status(400).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
