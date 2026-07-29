const rateLimit = require("express-rate-limit");

// Slows down brute-force login/register attempts against a single account
// or from a single client, without needing a captcha or external service.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many attempts. Please wait a few minutes and try again.",
  },
});

module.exports = { authLimiter };
