const jwt = require("jsonwebtoken");

// Confirms the request carries a valid member session (Bearer token) and
// attaches req.userId — used for routes that are self-only (no admin
// key bypass), like editing your own profile.
function requireAuth(req, res, next) {
  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Log in to do that" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ error: "Your session expired. Please log in again." });
  }
}

module.exports = requireAuth;
