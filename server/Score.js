const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  username: String,
  score: Number,
  date: { type: Date, default: Date.now },
});

scoreSchema.index({ score: -1 });
scoreSchema.index({ username: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

module.exports = mongoose.model("Score", scoreSchema);