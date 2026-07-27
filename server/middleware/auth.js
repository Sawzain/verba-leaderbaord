const jwt = require("jsonwebtoken");

// Verifies a member's login token (separate from the admin x-api-key).
// Used to gate review submission so a review is always tied to a real
// account, not just a typed-in name.
function requireAuth(req, res, next) {
  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Log in to do that" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    req.userName = payload.name;
    next();
  } catch (err) {
    res.status(401).json({ error: "Your session expired. Please log in again." });
  }
}

module.exports = requireAuth;
