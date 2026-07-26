require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const allowedOrigin = process.env.FRONTEND_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));
app.use(express.json());

if (!process.env.MONGO_URI) {
  console.error(
    "Missing MONGO_URI environment variable. Copy .env.example to .env and fill in your connection string.",
  );
  process.exit(1);
}
if (!process.env.API_KEY) {
  console.error(
    "Missing API_KEY environment variable. Generate one with: openssl rand -hex 24",
  );
  process.exit(1);
}

function requireApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (key !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

const Score = require("./Score");

// GET: Verify an admin key without doing anything mutating.
// The frontend uses this to show a clear "unlocked" state instead of
// only finding out the key is wrong after a failed add/edit/delete.
app.get("/api/admin/verify", requireApiKey, (req, res) => {
  res.json({ ok: true });
});

// GET: Fetch all members (using Score model)
app.get("/api/members", async (req, res) => {
  try {
    const scores = await Score.find();
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// POST: Add a new member (using Score model)
app.post("/api/members", requireApiKey, async (req, res) => {
  const username = (req.body.username || "").trim();
  const score = Number(req.body.score) || 0;

  if (!username) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const newEntry = new Score({ username, score });
    await newEntry.save();
    res.json(newEntry);
  } catch (err) {
    res.status(500).json({ error: "Failed to add entry" });
  }
});

// DELETE: Remove by id
app.delete("/api/members/:id", requireApiKey, async (req, res) => {
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
app.put("/api/members/:id", requireApiKey, async (req, res) => {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
