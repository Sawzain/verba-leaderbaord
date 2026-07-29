const jwt = require("jsonwebtoken");

// Authorizes either the admin (x-api-key) or the review's own author
// (Bearer token) to edit/remove a review — a member manages their own
// review, an admin can still step in for abusive or off-topic ones.
function authorizeReviewOwnerOrAdmin(req, res, next) {
  const key = req.headers["x-api-key"];
  if (key && key === process.env.API_KEY) {
    req.isAdmin = true;
    return next();
  }

  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Log in to do that" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    req.userName = payload.name;
    req.isAdmin = Boolean(payload.isAdmin);
    next();
  } catch (err) {
    res
      .status(401)
      .json({ error: "Your session expired. Please log in again." });
  }
}

module.exports = authorizeReviewOwnerOrAdmin;
