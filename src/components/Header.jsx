import { OLIVE_DARK, LOGO_SRC } from "../theme";

export default function Header() {
  return (
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <img
        src={LOGO_SRC}
        alt="Verba Book Club"
        style={{
          width: 160,
          height: 160,
          objectFit: "cover",
          borderRadius: "16px",
          display: "block",
          margin: "0 auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      />
      <div
        style={{
          marginTop: 12,
          fontSize: 13,
          color: OLIVE_DARK,
          letterSpacing: "2px",
          textTransform: "uppercase",
          opacity: 0.8,
        }}
      >
        Reading Leaderboard
      </div>
    </div>
  );
}
