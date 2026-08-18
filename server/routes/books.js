const express = require("express");
const Book = require("../models/Book");
const Review = require("../models/Review");
const User = require("../models/User");
const Score = require("../Score");
const ActivityLog = require("../models/ActivityLog");
const requireApiKey = require("../middleware/apiKey");
const requireAuth = require("../middleware/auth");

const {
  upload,
  saveCoverImage,
  deleteCoverAssets,
} = require("../config/cloudinary");
const { awardReviewPoints } = require("../utils/points");
const { REQUIRE_EMAIL_VERIFICATION } = require("../config/env");

const router = express.Router();

/// GET: all books, each with an average rating and review count
router.get("/", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 24));
  const skip = (page - 1) * limit;

  try {
    const [books, total] = await Promise.all([
      Book.aggregate([
        { $sort: { addedAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "book",
            as: "reviews",
          },
        },
        {
          $addFields: {
            reviewCount: { $size: "$reviews" },
            avgRating: {
              $cond: {
                if: { $gt: [{ $size: "$reviews" }, 0] },
                then: { $round: [{ $avg: "$reviews.rating" }, 1] },
                else: null,
              },
            },
          },
        },
        { $project: { reviews: 0 } },
      ]),
      Book.countDocuments(),
    ]);

    res.json({
      books,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: one book with its full review list, avgRating, and reviewCount
router.get("/:id", async (req, res) => {
  try {
    const [book, reviews] = await Promise.all([
      Book.findById(req.params.id).lean(),
      Review.find({ book: req.params.id })
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!book) return res.status(404).json({ error: "Book not found" });

    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = reviews.length
      ? Math.round((totalRating / reviews.length) * 10) / 10
      : null;

    res.json({
      ...book,
      avgRating,
      reviewCount: reviews.length,
      reviews: reviews.map((r) => ({
        id: r._id,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
        edited: Boolean(r.updatedAt),
        reviewer: r.user?.name || "Former member",
        userId: r.user?._id?.toString() || null,
      })),
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid book id" });
  }
});

// POST: add a book (admin only), with an optional cover image upload
router.post("/", requireApiKey, upload.single("cover"), async (req, res) => {
  const title = (req.body.title || "").trim();
  const author = (req.body.author || "").trim();

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    // Case-insensitive duplicate check — mirrors the same guard on
    // POST /api/members, since book titles are also typed in by hand.
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await Book.findOne({
      title: new RegExp(`^${escaped}$`, "i"),
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: `"${title}" is already on the shelf` });
    }

    let coverImage = "";
    let coverPublicId = "";
    if (req.file) {
      const uploaded = await saveCoverImage(req.file.buffer);
      coverImage = uploaded.url;
      coverPublicId = uploaded.publicId;
    }
    const book = await Book.create({
      title,
      author,
      coverImage,
      coverPublicId,
    });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: "Failed to add book" });
  }
});

// PUT: update a book (admin only), with optional cover image upload
router.put("/:id", requireApiKey, upload.single("cover"), async (req, res) => {
  const title = (req.body.title || "").trim();
  const author = (req.body.author || "").trim();

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    // Same case-insensitive duplicate guard as POST, but excluding this
    // book's own id — otherwise saving a book without changing its title
    // would incorrectly flag itself as a duplicate.
    if (title.toLowerCase() !== book.title.toLowerCase()) {
      const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const existing = await Book.findOne({
        _id: { $ne: book._id },
        title: new RegExp(`^${escaped}$`, "i"),
      });
      if (existing) {
        return res
          .status(409)
          .json({ error: `"${title}" is already on the shelf` });
      }
    }

    book.title = title;
    book.author = author;

    if (req.file) {
      if (book.coverImage) {
        deleteCoverAssets(book);
      }
      const uploaded = await saveCoverImage(req.file.buffer);
      book.coverImage = uploaded.url;
      book.coverPublicId = uploaded.publicId;
    }

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: "Failed to update book" });
  }
});

// DELETE: remove a book (admin only) — also clears its reviews and cover file
router.delete("/:id", requireApiKey, async (req, res) => {
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

// PATCH: toggle a book's "current pick" status (admin only)
router.patch("/:id/current-pick", requireApiKey, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    const makeCurrent = !book.isCurrentPick;
    if (makeCurrent) {
      await Book.updateMany(
        { _id: { $ne: book._id } },
        { isCurrentPick: false, currentPickSetAt: null },
      );
    }
    book.isCurrentPick = makeCurrent;
    if (makeCurrent) {
      const requestedDate = req.body?.currentPickSetAt
        ? new Date(req.body.currentPickSetAt)
        : new Date();
      book.currentPickSetAt = isNaN(requestedDate.getTime())
        ? new Date()
        : requestedDate;
    } else {
      book.currentPickSetAt = null;
    }
    await book.save();
    res.json({
      isCurrentPick: book.isCurrentPick,
      currentPickSetAt: book.currentPickSetAt,
    });
  } catch (err) {
    res.status(400).json({ error: "Couldn't update the current pick" });
  }
});

// POST: add a review
router.post("/:id/reviews", requireAuth, async (req, res) => {
  const rating = Number(req.body.rating);
  const text = (req.body.text || "").trim().slice(0, 2000);

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  try {
    if (REQUIRE_EMAIL_VERIFICATION) {
      const author = await User.findById(req.userId);
      if (!author?.emailVerified) {
        return res.status(403).json({
          error: "Please verify your email before submitting a review.",
        });
      }
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    const review = await Review.create({
      book: book._id,
      user: req.userId,
      rating,
      text,
    });

    await awardReviewPoints(req.userName);
    // Log to activity feed if this reviewer's account is linked to a
    // leaderboard entry. Silently skipped if not linked — reviews from
    // unlinked members just won't show in the feed yet.
    const linkedScore = await Score.findOne({ userId: req.userId });
    if (linkedScore) {
      await ActivityLog.create({
        scoreId: linkedScore._id,
        type: "review",
        bookId: book._id,
      });
    }

    res.json({
      id: review._id,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
      edited: false,
      reviewer: req.userName,
      userId: req.userId,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "You've already reviewed this book" });
    }
    res.status(400).json({ error: "Invalid book id" });
  }
});

module.exports = router;
