const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  username: String,
  score: Number,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    sparse: true,
    unique: true,
  },
  // Discord user ID, set by an admin when adding the member. Login links
  // an account to this entry only when the IDs match. select:false keeps
  // it out of the public leaderboard responses.
  discordId: { type: String, trim: true, sparse: true, unique: true, select: false },
  date: { type: Date, default: Date.now },
});

scoreSchema.index({ score: -1 });
scoreSchema.index(
  { username: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

module.exports = mongoose.model("Score", scoreSchema);
