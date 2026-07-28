import { Link, useLocation } from "react-router-dom";
import { OLIVE_DARK, LOGO_SRC } from "../theme";

// Subtitle now reflects whichever route is actually active, instead of
// always reading "READING LEADERBOARD" no matter which view you're on.
const SUBTITLES = {
  "/app/leaderboard": "Reading Leaderboard",
  "/app/reviews": "Book Reviews",
  "/app/manage": "Admin Panel",
};

export default function Header() {
  const location = useLocation();
  // On the public landing page, show the brand tagline instead of an
  // app-view label; on any other unmatched route, show nothing.
  const subtitle =
    location.pathname === "/"
      ? "words that stay"
      : (SUBTITLES[location.pathname] ?? null);

  const logoImg = (
    <img
      src={LOGO_SRC}
      alt="Verba Book Club"
      style={{
        width: 140,
        height: 140,
        objectFit: "cover",
        borderRadius: "16px",
        display: "block",
        margin: "0 auto",
        boxShadow: "0 8px 30px rgba(45, 60, 45, 0.15)",
      }}
    />
  );

  return (
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      {location.pathname === "/" ? (
        logoImg
      ) : (
        <Link to="/" aria-label="Back to Verba Book Club home">
          {logoImg}
        </Link>
      )}
      {subtitle && (
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
          {subtitle}
        </div>
      )}
    </div>
  );
}
