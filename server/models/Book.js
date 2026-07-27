const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, trim: true, default: "" },
  // Path under /uploads, e.g. "/uploads/169..."; empty string if no cover set.
  coverImage: { type: String, default: "" },
  addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Book", bookSchema);
