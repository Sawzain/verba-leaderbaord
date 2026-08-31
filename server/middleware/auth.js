const jwt = require("jsonwebtoken");

// Name of the httpOnly cookie holding the session JWT. Exported so
// routes/auth.js (setting/clearing it) and middleware/csrf.js (checking
// whether a cookie-based session is in play) stay in sync with this file
// instead of each hardcoding the string separately.
const COOKIE_NAME = "verba_token";

function getToken(req) {
  return req.cookies?.[COOKIE_NAME] || null;
}

// Verifies a member's session cookie (separate from the legacy admin
// x-api-key). Used to gate review submission so a review is always tied
// to a real account, not just a typed-in name.
function requireAuth(req, res, next) {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ error: "Log in to do that" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    req.userName = payload.name;
    req.userIsAdmin = Boolean(payload.isAdmin);
    next();
  } catch (err) {
    res.status(401).json({ error: "Your session expired. Please log in again." });
  }
}

// Requires a logged-in member whose account is flagged isAdmin — an
// individual admin login, as opposed to the legacy shared x-api-key.
// Kept as a separate function (rather than requireAuth + a check) so
// apiKey.js can compose it with the legacy key check per-route.
function requireAdminAccount(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ error: "Log in as an admin to do that" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.isAdmin) {
      return res.status(403).json({ error: "Your account doesn't have admin access" });
    }
    req.userId = payload.sub;
    req.userName = payload.name;
    req.userIsAdmin = true;
    next();
  } catch (err) {
    res.status(401).json({ error: "Your session expired. Please log in again." });
  }
}

module.exports = requireAuth;
module.exports.requireAdminAccount = requireAdminAccount;
module.exports.COOKIE_NAME = COOKIE_NAME;
