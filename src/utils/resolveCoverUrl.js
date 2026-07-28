import { API_ROOT } from "../hooks/useMembers";

// API_ROOT is either "/api" (dev, proxied by Vite) or an absolute URL like
// "https://your-app.onrender.com/api" (prod, set via VITE_API_BASE).
// Cover images are stored as "/uploads/xxx.jpg" — relative to the *backend*,
// not the page. In dev that's fine because Vite also proxies /uploads. In
// prod, the frontend (Vercel) and backend (Render) are different origins,
// so a bare "/uploads/..." src resolves against the wrong domain and 404s.
// This strips the "/api" suffix off API_ROOT to get the backend's origin,
// then prefixes it onto the stored path.
const BACKEND_ORIGIN = API_ROOT.replace(/\/api\/?$/i, "");

export function resolveCoverUrl(coverImage) {
  if (!coverImage) return "";
  if (/^https?:\/\//i.test(coverImage)) return coverImage;
  return `${BACKEND_ORIGIN}${coverImage}`;
}
