const express = require("express");
const Book = require("../models/Book");
const Review = require("../models/Review");
const User = require("../models/User");
const requireApiKey = require("../middleware/apiKey");
const requireAuth = require("../middleware/auth");
const { upload, saveCoverImage, deleteCoverAssets } = require("../config/cloudinary");
const { awardReviewPoints } = require("../utils/points");
const { REQUIRE_EMAIL_VERIFICATION } = require("../config/env");

const router = express.Router();

// GET: all books, each with an average rating and review count
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ addedAt: -1 }).lean();
    const summaries = await Review.aggregate([
      {
        $group: {
          _id: "$book",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
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
router.get("/:id", async (req, res) => {
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
        // Presence of updatedAt (only set on an actual edit) drives the
        // "(edited)" badge in the UI.
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

// PATCH: toggle a book's "current pick" status (admin only). Setting a
// book as the current pick clears the flag on every other book first, so
// exactly one (or zero) books can ever be the current pick. Calling this
// again on the book that's already the current pick unsets it.
router.patch("/:id/current-pick", requireApiKey, async (req, res) => {
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

// POST: add a review — requires a logged-in member; if REQUIRE_EMAIL_VERIFICATION
// is enabled, their email must also be verified. The one-review-per-person
// rule is enforced by the unique (book, user) index on Review, so this is
// safe even against duplicate/concurrent submissions, not just a check done
// in this handler.
router.post("/:id/reviews", requireAuth, async (req, res) => {
  const rating = Number(req.body.rating);
  const text = (req.body.text || "").trim();

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
