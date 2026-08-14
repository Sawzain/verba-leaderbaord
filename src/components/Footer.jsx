import { SAGE_DEEP, MUTED } from "../theme";

export const DISCORD_INVITE_URL = "https://discord.gg/7a2H9bcXZ2";
export const INSTAGRAM_URL = "https://www.instagram.com/bookclub_verba";

export default function Footer({ maxWidth = 720 }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth,
        margin: "0 auto",
        textAlign: "center",

        padding: "20px 16px calc(20px + env(safe-area-inset-bottom))",
        borderTop: `1px solid ${MUTED}33`,
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
          style={{ color: SAGE_DEEP, fontSize: 13, textDecoration: "none" }}
        >
          Discord
        </a>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="verba-link-pill"
          style={{ color: SAGE_DEEP, fontSize: 13, textDecoration: "none" }}
        >
          Instagram
        </a>
      </div>
      <div style={{ fontSize: 12, color: SAGE_DEEP, opacity: 0.85 }}>
        Verba Book Club © {new Date().getFullYear()} · Est. 2025
      </div>
    </div>
  );
}
