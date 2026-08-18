// Core sage family — SAGE is the primary page background (unchanged from
// the original brand color), SAGE_DARK/SAGE_DEEP are darker tones drawn
// from the same hue rather than jumping to an unrelated green.
export const SAGE = "#B7C7AC";
export const SAGE_DARK = "#5F7355";
export const SAGE_DEEP = "#2D3327";

// Neutrals — warm off-white for cards, warm dark gray for body text,
// sage-tinted gray for secondary/muted text.
export const PAPER = "#F5F1DF";
export const INK = "#2D2D28";
export const MUTED = "#8A8E7A";
export const PLACEHOLDER = "#999"; // or "#aaa" or whatever matches your browser default

// Soft tinted fills — for badges/pills that need to sit quietly against
// PAPER without competing with CLAY, which is reserved for emphasis.
export const SAGE_TINT = "rgba(95, 115, 85, 0.12)";
export const CLAY_TINT = "rgba(196, 112, 63, 0.15)";

// Accent — the one non-green color in the system. Used sparingly: top-rank
// badges, primary CTAs, active/highlight states only.
export const CLAY = "#C4703F";

// Avatar palette — deterministic colors assigned per-name (via hash) for
// members without a photo. Kept as a named, ordered array here so every
// avatar anywhere in the app draws from the same set instead of each
// component hardcoding its own list.
export const AVATAR_COLORS = [SAGE_DARK, CLAY, "#8a6a3a", "#5a7a6a", "#6b5b8a"];

export function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export const LOGO_SRC = "/logo.jpg";

// Destructive actions (logout confirm, delete, etc.)
export const DANGER = "#a24040";
export const DANGER_LIGHT = "#f0d3d3";
export const DANGER_DARK = "#e0b3b3";

// Typography — Instrument Serif for headings/titles/quotes, Plus Jakarta
// Sans for UI/body text, JetBrains Mono for rank numbers and meta labels.
// Loaded via Google Fonts in index.html.
export const FONT_SERIF = "'Instrument Serif', serif";
export const FONT_SANS = "'Plus Jakarta Sans', sans-serif";
export const FONT_MONO = "'JetBrains Mono', monospace";
