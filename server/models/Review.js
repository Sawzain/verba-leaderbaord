const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, trim: true, default: "", maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
  // Set only when a review is edited after creation (see PUT /api/reviews/:id)
  // — its presence, not its value, drives the "(edited)" badge in the UI.
  updatedAt: { type: Date },
});

// This is the actual "check and balance": a unique compound index means
// MongoDB itself rejects a second (book, user) pair, even under concurrent
// requests. The API layer just turns that rejection into a friendly error —
// the guarantee lives here, not in application logic that could be raced.
reviewSchema.index({ book: 1, user: 1 }, { unique: true });
// Speeds up member-profile review lookups (Review.find({ user: score.userId }))
reviewSchema.index({ user: 1 });

module.exports = mongoose.model("Review", reviewSchema);
