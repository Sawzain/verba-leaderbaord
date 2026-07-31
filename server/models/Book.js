const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, trim: true, default: "" },
  coverImage: { type: String, default: "" },
  coverPublicId: { type: String, default: "" },
  isCurrentPick: { type: Boolean, default: false },
  addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Book", bookSchema);
