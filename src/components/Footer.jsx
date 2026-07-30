import { OLIVE_DARK, OLIVE_LIGHT } from "../theme";
export const DISCORD_INVITE_URL = "https://discord.gg/7a2H9bcXZ2";
export const INSTAGRAM_URL = "https://www.instagram.com/bookclub_verba";

// Shared footer used on every page (landing and the /app/* views) so the
// social links and copyright line don't have to be duplicated — and so a
// contrast fix here applies everywhere at once.
export default function Footer({ maxWidth = 720 }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth,
        textAlign: "center",
        padding: "20px 16px 0",
        borderTop: `1px solid ${OLIVE_LIGHT}55`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginBottom: 10,
        }}
      >
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="verba-link-pill"
          style={{ color: OLIVE_DARK, fontSize: 13, textDecoration: "none" }}
        >
          Discord
        </a>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="verba-link-pill"
          style={{ color: OLIVE_DARK, fontSize: 13, textDecoration: "none" }}
        >
          Instagram
        </a>
      </div>
      <div style={{ fontSize: 12, color: OLIVE_DARK, opacity: 0.85 }}>
        Verba Book Club © {new Date().getFullYear()} · Est. 2025
      </div>
    </div>
  );
}
