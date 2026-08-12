// src/components/AccountChip.jsx
import { useState } from "react";
import { useAuthContext } from "../AuthContext";
import AuthPanel from "./AuthPanel";
import { OLIVE_DARK, CREAM, CREAM_DARK } from "../theme";

const AVATAR_COLORS = [OLIVE_DARK, "#8a9a4a", "#8a6a3a", "#5a7a6a"];
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const chipStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 20,
  background: CREAM,
  color: OLIVE_DARK,
  fontSize: 12,
  fontFamily: "'Georgia', serif",
  border: "none",
  cursor: "pointer",
  flexShrink: 0,
  whiteSpace: "nowrap",
};

export default function AccountChip({ compact = false }) {
  const auth = useAuthContext();
  const [showLogin, setShowLogin] = useState(false);

  if (auth.isLoggedIn) {
    return (
      <div style={{ position: "relative" }}>
        <button onClick={auth.logout} style={chipStyle} title="Log out">
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: avatarColor(auth.user?.name || ""),
              color: CREAM,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            {initials(auth.user?.name || "?")}
          </div>
          {!compact && (auth.user?.name?.split(" ")[0] ?? "Log out")}
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setShowLogin((v) => !v)} style={chipStyle}>
        👤 {!compact && "Log in"}
      </button>
      {showLogin && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 200,
            width: 280,
            background: CREAM,
            borderRadius: 12,
            border: `1px solid ${CREAM_DARK}`,
            padding: 14,
            boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
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
        </div>
      )}
    </div>
  );
}
