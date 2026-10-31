const express = require("express");
const crypto = require("crypto");
const DiscordMember = require("../models/DiscordMember");
const Score = require("../models/Score");
const requireApiKey = require("../middleware/apiKey");
const logger = require("../utils/logger");

const router = express.Router();

// Only the bot may write here. Same pattern as the Vercel bridge secret.
function requireBotSecret(req, res, next) {
  const secret = process.env.BOT_SYNC_SECRET || "";
  const sent = String(req.headers["x-bot-secret"] || "");
  const a = Buffer.from(sent);
  const b = Buffer.from(secret);
  if (!secret || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// POST: bot sends a batch (max 200) of members to add or update.
router.post("/sync", requireBotSecret, async (req, res) => {
  const incoming = Array.isArray(req.body?.members) ? req.body.members : [];
  const ops = incoming
    .filter((m) => m && /^\d{15,25}$/.test(String(m.discordId)))
    .slice(0, 200)
    .map((m) => ({
      updateOne: {
        filter: { discordId: String(m.discordId) },
        update: {
          $set: {
            username: String(m.username || "").slice(0, 100),
            displayName: String(m.displayName || "").slice(0, 100),
          },
        },
        upsert: true,
      },
    }));
  if (ops.length === 0) return res.json({ ok: true, count: 0 });

  try {
    await DiscordMember.bulkWrite(ops, { ordered: false });
    res.json({ ok: true, count: ops.length });
  } catch (err) {
    logger.error("POST /api/discord-members/sync failed", err);
    res.status(500).json({ error: "Sync failed" });
  }
});

// DELETE: bot removes someone who left the server.
router.delete("/:discordId", requireBotSecret, async (req, res) => {
  try {
    await DiscordMember.deleteOne({ discordId: String(req.params.discordId) });
    res.sendStatus(204);
  } catch (err) {
    logger.error("DELETE /api/discord-members failed", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// GET: admin-only search for the autofill. Hides IDs already used on the
// leaderboard so you can't pick the same person twice.
router.get("/", requireApiKey, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().slice(0, 50);
    if (q.length < 2) return res.json([]);
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const taken = (await Score.distinct("discordId")).filter(Boolean);
    const found = await DiscordMember.find(
      {
        discordId: { $nin: taken },
        $or: [{ username: rx }, { displayName: rx }],
      },
      "discordId username displayName",
    )
      .sort({ displayName: 1 })
      .limit(10)
      .lean();
    res.json(found);
  } catch (err) {
    logger.error("GET /api/discord-members failed", err);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;