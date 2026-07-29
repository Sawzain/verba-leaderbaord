const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const requireApiKey = require("../middleware/apiKey");

const router = express.Router();

// GET: Verify admin access — works with either the legacy shared x-api-key
// or a logged-in admin account's Bearer token. The frontend uses this to
// show a clear "unlocked" state instead of only finding out after a failed
// add/edit/delete.
router.get("/verify", requireApiKey, (req, res) => {
  res.json({ ok: true });
});

// POST: admin-assisted password reset. There's no email service configured
// for this flow, so it doesn't send anything automatically — it generates a
// fresh temporary password and hands it back to the admin, who relays it to
// the member out of band (Discord DM, in person, etc). The member can't
// request this themselves; it requires the admin x-api-key.
router.post("/reset-password", requireApiKey, async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ error: "No account found with that email" });
    }

    const tempPassword = crypto.randomBytes(6).toString("hex"); // 12 chars
    user.passwordHash = await bcrypt.hash(tempPassword, 10);
    await user.save();

    res.json({ email: user.email, name: user.name, tempPassword });
  } catch (err) {
    res.status(500).json({ error: "Couldn't reset that password" });
  }
});

module.exports = router;
