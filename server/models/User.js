const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: { type: String },
  discordId: { type: String, unique: true, sparse: true },
  isAdmin: { type: Boolean, default: false },
  // Discord accounts are trusted as verified (Discord already confirmed the
  // email on their end); email/password accounts start false until they
  // click the link sent to their inbox.
  emailVerified: { type: Boolean, default: true },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
