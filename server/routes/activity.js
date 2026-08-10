const express = require("express");
const ActivityLog = require("../models/ActivityLog");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const entries = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("scoreId", "username")
      .populate("bookId", "title");

    const feed = entries
      .filter((e) => e.scoreId) // guard against orphaned rows
      .map((e) => ({
        type: e.type,
        memberName: e.scoreId.username,
        bookTitle: e.bookId?.title || null,
        createdAt: e.createdAt,
      }));

    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: "Couldn't load activity" });
  }
});

module.exports = router;
