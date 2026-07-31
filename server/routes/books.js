const express = require("express");
const Book = require("../models/Book");
const Review = require("../models/Review");
const User = require("../models/User");
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
  try {
    const books = await Book.aggregate([
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "book", // Updated to match your schema field
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
      {
        $project: {
          reviews: 0, // exclude the full reviews array to keep the payload clean
        },
      },
    ]);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: one book with its full review list, avgRating, and reviewCount
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ error: "Book not found" });

    const reviews = await Review.find({ book: book._id })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

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

// POST: add a review
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
