// Small env-derived constants shared across routes. Doesn't touch
// process.exit — the required-var checks that used to live at the top of
// server.js stay in server.js, since that's the only place that should be
// allowed to kill the process.

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://localhost:5000";
const FRONTEND_REDIRECT =
  process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Whether email verification is actually enforced. Paused by default while
// the Resend sending domain isn't verified yet — set
// REQUIRE_EMAIL_VERIFICATION=true in .env once outbound email is reliable.
const REQUIRE_EMAIL_VERIFICATION =
  process.env.REQUIRE_EMAIL_VERIFICATION === "true";

// Points awarded to a member's leaderboard score when they submit a review.
const REVIEW_POINTS = Number(process.env.REVIEW_POINTS) || 10;

// Off by default — see utils/points.js for why.
const AUTO_AWARD_REVIEW_POINTS =
  process.env.AUTO_AWARD_REVIEW_POINTS === "true";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const DISCORD_CONFIGURED = Boolean(
  DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET && DISCORD_REDIRECT_URI,
);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

module.exports = {
  BACKEND_ORIGIN,
  FRONTEND_REDIRECT,
  REQUIRE_EMAIL_VERIFICATION,
  REVIEW_POINTS,
  AUTO_AWARD_REVIEW_POINTS,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  DISCORD_CONFIGURED,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_CONFIGURED,
};
