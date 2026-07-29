const Score = require("../Score");
const { REVIEW_POINTS, AUTO_AWARD_REVIEW_POINTS } = require("../config/env");

// ===================== Leaderboard points for reviews =====================
// The Leaderboard (Score model) and Books/Reviews (User model) are two
// separate systems that predate each other — Score entries are just a
// username string, not linked to a User account. To connect them without a
// bigger migration, a review's points are credited to the Score entry whose
// username matches the reviewer's account name (case-insensitively). If no
// matching Score entry exists yet, one is created.
//
// Turned OFF by default (AUTO_AWARD_REVIEW_POINTS) — with review volume
// still low, matching by name string was creating duplicate leaderboard
// entries whenever a review-login name didn't exactly match how someone was
// already listed on the leaderboard (e.g. "Sajen Malakar" vs "Sajen").
// Points are managed by hand in Manage instead for now. Set
// AUTO_AWARD_REVIEW_POINTS=true to turn this back on once accounts and
// leaderboard names are fully unified.

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function awardReviewPoints(username) {
  if (!AUTO_AWARD_REVIEW_POINTS) return;
  const name = (username || "").trim();
  if (!name) return;
  const match = new RegExp(`^${escapeRegex(name)}$`, "i");
  const score = await Score.findOne({ username: match });
  if (score) {
    score.score = (score.score || 0) + REVIEW_POINTS;
    await score.save();
  } else {
    await Score.create({ username: name, score: REVIEW_POINTS });
  }
}

// Called when a review is removed, so deleting or editing away a review
// doesn't leave stale points on the leaderboard.
async function revokeReviewPoints(username) {
  if (!AUTO_AWARD_REVIEW_POINTS) return;
  const name = (username || "").trim();
  if (!name) return;
  const match = new RegExp(`^${escapeRegex(name)}$`, "i");
  const score = await Score.findOne({ username: match });
  if (score) {
    score.score = Math.max(0, (score.score || 0) - REVIEW_POINTS);
    await score.save();
  }
}

module.exports = { awardReviewPoints, revokeReviewPoints };
