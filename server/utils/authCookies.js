const crypto = require("crypto");
const { COOKIE_NAME } = require("../middleware/auth");
const { CSRF_COOKIE_NAME } = require("../middleware/csrf");

// IMPORTANT — this assumes Render (or wherever this deploys) sets
// NODE_ENV=production. If it doesn't, cookies fall back to dev settings
// (secure: false, sameSite: "lax") in production, which will NOT work
// across the Vercel/Render domain split — login will silently fail to
// persist. Verify NODE_ENV is actually set in the production environment
// before relying on this.
const isProd = process.env.NODE_ENV === "production";

// SameSite=None is required when the frontend (Vercel) and backend
// (Render) are on different domains; None requires Secure too. In dev,
// Vite's proxy makes them same-origin (see vite.config.js), so
// Lax + non-Secure works over plain http://localhost, where Secure
// cookies wouldn't be sent at all.
const baseCookieOptions = {
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches the JWT's own expiry
  path: "/",
};

function setAuthCookies(res, token) {
  res.cookie(COOKIE_NAME, token, { ...baseCookieOptions, httpOnly: true });
  // Deliberately NOT httpOnly — the frontend needs to read this value to
  // echo it back as the X-CSRF-Token header (see csrf.js).
  res.cookie(CSRF_COOKIE_NAME, crypto.randomBytes(24).toString("hex"), {
    ...baseCookieOptions,
    httpOnly: false,
  });
}

function clearAuthCookies(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.clearCookie(CSRF_COOKIE_NAME, { path: "/" });
}

module.exports = { setAuthCookies, clearAuthCookies };
