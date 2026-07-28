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
});

module.exports = mongoose.model("Book", bookSchema);
