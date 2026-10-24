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

// Cross-site in production: the CSRF cookie belongs to the API origin, so
// document.cookie can't see it. The server returns the token in the JSON
// of /me, /login and /register, and we keep it here in memory.
let memoryToken = null;
export function setCsrfToken(token) {
  memoryToken = token || null;
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function apiFetch(url, options = {}) {
  const csrfToken = memoryToken || readCookie(CSRF_COOKIE_NAME);
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
  });
}
