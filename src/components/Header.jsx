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
  const auth = useAuthContext();
  const [showLogin, setShowLogin] = useState(false);

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

  const showAccountArea = location.pathname !== "/";

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

      {showAccountArea && auth.isLoggedIn && (
        <div style={{ marginTop: 10, fontSize: 13, color: OLIVE_DARK }}>
          Logged in as <strong>{auth.user?.name}</strong> ·{" "}
          <button
            onClick={auth.logout}
            className="verba-link-btn"
            style={{
              background: "none",
              border: "none",
              color: OLIVE_DARK,
              fontSize: 13,
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Log out
          </button>
        </div>
      )}

      {showAccountArea && !auth.isLoggedIn && !showLogin && (
        <button
          onClick={() => setShowLogin(true)}
          className="verba-link-btn"
          style={{
            marginTop: 10,
            background: "none",
            border: "none",
            color: OLIVE_DARK,
            fontSize: 13,
            textDecoration: "underline",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Log in
        </button>
      )}

      {showAccountArea && !auth.isLoggedIn && showLogin && (
        <div
          style={{
            marginTop: 14,
            maxWidth: 320,
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "left",
          }}
        >
          <AuthPanel
            authError={auth.authError}
            setAuthError={auth.setAuthError}
            authBusy={auth.authBusy}
            onRegister={auth.register}
            onLogin={auth.login}
            onForgotPassword={auth.forgotPassword}
            discordLoginUrl={auth.discordLoginUrl}
          />
          <button
            onClick={() => setShowLogin(false)}
            className="verba-link-btn"
            style={{
              background: "none",
              border: "none",
              color: OLIVE_DARK,
              fontSize: 12,
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
              marginTop: 8,
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
