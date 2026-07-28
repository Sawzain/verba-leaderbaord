const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  // Not required at the schema level: Discord-only accounts may not share
  // an email, and password-based accounts are validated in the route
  // handler instead. `sparse: true` means multiple docs can have no email
  // without tripping the unique index.
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  // Set for accounts created (or linked) via "Log in with Discord".
  discordId: { type: String, unique: true, sparse: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
