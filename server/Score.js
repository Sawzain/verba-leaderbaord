const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  username: String,
  score: Number,
  date: { type: Date, default: Date.now },
});

scoreSchema.index({ score: -1 });

module.exports = mongoose.model("Score", scoreSchema);
