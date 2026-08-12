import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { OLIVE_DARK, LOGO_SRC } from "../theme";
import { useAuthContext } from "../AuthContext";
import AuthPanel from "./AuthPanel";

const SUBTITLES = {
  "/app/leaderboard": "Reading Leaderboard",
  "/app/reviews": "Book Reviews",
  "/app/manage": "Admin Panel",
};

export default function Header() {
  const location = useLocation();

  const subtitle =
    location.pathname === "/"
      ? "words that stay"
      : (SUBTITLES[location.pathname] ?? null);

  const logoImg = (
    <img
      src={LOGO_SRC}
      alt="Verba Book Club"
      style={{
        width: "clamp(70px, 18vw, 100px)",
        height: "clamp(70px, 18vw, 100px)",
        objectFit: "cover",
        borderRadius: "16px",
        display: "block",
        margin: "0 auto",
        boxShadow: "0 8px 30px rgba(45, 60, 45, 0.08)",
      }}
    />
  );

  return (
    <div style={{ textAlign: "center", marginBottom: 20 }}>
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
