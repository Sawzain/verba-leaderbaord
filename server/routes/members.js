const express = require("express");
const Score = require("../Score");
const requireApiKey = require("../middleware/apiKey");

const router = express.Router();

// GET: Fetch all members
router.get("/", async (req, res) => {
  try {
    const scores = await Score.find();
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// POST: Add a new member
router.post("/", requireApiKey, async (req, res) => {
  const username = (req.body.username || "").trim();
  const score = Number(req.body.score) || 0;

  if (!username) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    // Case-insensitive duplicate check — leaderboard names are added
    // manually by an admin, so this is the only guard against "Sam" and
    // "sam" (or "Sam ") ending up as two separate entries.
    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await Score.findOne({
      username: new RegExp(`^${escaped}$`, "i"),
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: `"${username}" is already on the leaderboard` });
    }

    const newEntry = new Score({ username, score });
    await newEntry.save();
    res.json(newEntry);
  } catch (err) {
    res.status(500).json({ error: "Failed to add entry" });
  }
});

// DELETE: Remove by id
router.delete("/:id", requireApiKey, async (req, res) => {
  try {
    const deleted = await Score.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ error: "Invalid member id" });
  }
});

// PUT: Update score (and optionally name) by id
router.put("/:id", requireApiKey, async (req, res) => {
  try {
    const update = {};
    if (req.body.score !== undefined) update.score = req.body.score;
    if (req.body.username !== undefined) update.username = req.body.username;

    const updated = await Score.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Invalid member id" });
  }
});

module.exports = router;
