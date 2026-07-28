const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, trim: true, default: "" },
  // Full Cloudinary URL (or legacy "/uploads/xxx.jpg" path for covers
  // uploaded before the Cloudinary migration); empty string if no cover set.
  coverImage: { type: String, default: "" },
  // Cloudinary public_id, used to delete the asset when the book is removed.
  // Empty for legacy local-disk covers, which have no Cloudinary asset.
  coverPublicId: { type: String, default: "" },
  addedAt: { type: Date, default: Date.now },
  // Set by an admin to control the "Current pick" teaser on the public
  // landing page. Only one book should have this true at a time — the
  // server enforces that by clearing it on every other book whenever one
  // is newly selected, rather than trusting the client to do so.
  isCurrentPick: { type: Boolean, default: false },
});

module.exports = mongoose.model("Book", bookSchema);
