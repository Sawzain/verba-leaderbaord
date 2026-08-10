const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  scoreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Score",
    required: true,
  },
  type: {
    type: String,
    enum: ["book_read", "review", "quote", "poem"],
    required: true,
  },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  note: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
