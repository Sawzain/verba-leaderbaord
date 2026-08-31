// Shared wrapper for requests that rely on the logged-in member's
// session. Adds credentials: "include" so the httpOnly session cookie
// (set by the server on login/register) is actually sent — plain fetch
// doesn't include cookies on cross-origin requests by default — and
// echoes the CSRF cookie back as a header, which the server's csrf
// middleware checks against (double-submit pattern; see
// server/middleware/csrf.js).
//
// Keep CSRF_COOKIE_NAME in sync with CSRF_COOKIE_NAME in
// server/middleware/csrf.js — they can't literally share a constant
// across the frontend/backend boundary.
const CSRF_COOKIE_NAME = "verba_csrf";

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function apiFetch(url, options = {}) {
  const csrfToken = readCookie(CSRF_COOKIE_NAME);
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
  });
}
