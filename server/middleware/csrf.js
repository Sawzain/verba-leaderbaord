const { COOKIE_NAME } = require("./auth");

// Keep this in sync with CSRF_COOKIE_NAME in src/utils/apiFetch.js — the
// frontend reads this cookie by name to echo it back as a header.
const CSRF_COOKIE_NAME = "verba_csrf";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Double-submit CSRF check. The session cookie is SameSite=None in
// production (required since the frontend and API live on different
// domains — Vercel and Render), which loses the CSRF protection that
// SameSite=Strict/Lax normally provides for free. This closes that gap:
// a second, non-httpOnly cookie carries a random token the frontend must
// read and echo back as a header on every mutating request. A
// cross-site attacker can trigger the cookie to be sent automatically,
// but can't read its value to set the matching header.
//
// Only applies when a session cookie is present — the legacy x-api-key
// flow isn't cookie-based, so it isn't vulnerable to CSRF the same way,
// and requests with no session cookie at all (e.g. forgot-password) have
// nothing to protect.
function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (!req.cookies?.[COOKIE_NAME]) return next();

  const headerToken = req.headers["x-csrf-token"];
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: "Invalid or missing CSRF token" });
  }
  next();
}

module.exports = { csrfProtection, CSRF_COOKIE_NAME };
