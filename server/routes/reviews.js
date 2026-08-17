const express = require("express");
const Review = require("../models/Review");
const authorizeReviewOwnerOrAdmin = require("../middleware/reviewAuth");
const { revokeReviewPoints } = require("../utils/points");

const router = express.Router();

// PUT: edit a review — the review's own author, or an admin
router.put("/:id", authorizeReviewOwnerOrAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate(
      "user",
      "name",
    );
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (!req.isAdmin && review.user._id.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own review" });
    }

    if (req.body.rating !== undefined) {
      const rating = Number(req.body.rating);
      if (!rating || rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "Rating must be between 1 and 5" });
      }
      review.rating = rating;
    }
    if (req.body.text !== undefined) {
      review.text = String(req.body.text).trim().slice(0, 2000);
    }
    // Marks the review as edited for display purposes (see BookDetail.jsx).
    review.updatedAt = new Date();
    await review.save();

    res.json({
      id: review._id,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
      edited: true,
      reviewer: review.user?.name || "Former member",
      userId: review.user?._id?.toString() || null,
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid review id" });
  }
});

// DELETE: remove a review — the review's own author, or an admin
// (e.g. for abusive or off-topic reviews)
router.delete("/:id", authorizeReviewOwnerOrAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate(
      "user",
      "name",
    );
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (!req.isAdmin && review.user._id.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: "You can only remove your own review" });
    }

    const reviewerName = review.user?.name;
    await review.deleteOne();
    if (reviewerName) await revokeReviewPoints(reviewerName);

    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ error: "Invalid review id" });
  }
});

module.exports = router;
