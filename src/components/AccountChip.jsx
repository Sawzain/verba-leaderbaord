import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../AuthContext";
import AuthPanel from "./AuthPanel";
import { OLIVE_DARK, CREAM, CREAM_DARK, DANGER } from "../theme";

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

const avatarBtnStyle = (name, size) => ({
  width: size,
  height: size,
  borderRadius: "50%",
  background: avatarColor(name),
  color: CREAM,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
  flexShrink: 0,
});

const chipStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: 6,
  borderRadius: "50%",
  background: CREAM,
  border: "none",
  cursor: "pointer",
  flexShrink: 0,
};

const menuItemStyle = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "6px 8px",
  fontSize: 13,
  background: "none",
  border: "none",
  cursor: "pointer",
  borderRadius: 6,
  textDecoration: "none",
};

export default function AccountChip({ compact = false, myMemberId = null }) {
  const auth = useAuthContext();
  const [open, setOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const size = compact ? 24 : 30;
  const wrapRef = useRef(null);

  const closeAll = () => {
    setOpen(false);
    setConfirmingLogout(false);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        closeAll();
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (auth.isLoggedIn) {
    const name = auth.user?.name || "?";
    const avatarUrl = auth.user?.avatarUrl;

    return (
      <div ref={wrapRef} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{ ...chipStyle, padding: 0 }}
          aria-label="Account menu"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              style={{
                width: size,
                height: size,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div style={avatarBtnStyle(name, size)}>{initials(name)}</div>
          )}
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 200,
              minWidth: 190,
              background: CREAM,
              borderRadius: 12,
              border: `1px solid ${CREAM_DARK}`,
              padding: 10,
              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
              textAlign: "left",
            }}
          >
            {!confirmingLogout ? (
              <>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: OLIVE_DARK,
                    padding: "4px 8px 8px",
                    borderBottom: `1px solid ${CREAM_DARK}`,
                    marginBottom: 6,
                    wordBreak: "break-word",
                  }}
                >
                  {name}
                </div>

                {myMemberId && (
                  <Link
                    to={`/app/members/${myMemberId}`}
                    onClick={closeAll}
                    style={{ ...menuItemStyle, color: OLIVE_DARK }}
                  >
                    View Profile
                  </Link>
                )}

                <button
                  onClick={() => setConfirmingLogout(true)}
                  style={{ ...menuItemStyle, color: DANGER }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 13,
                    color: OLIVE_DARK,
                    padding: "4px 8px 10px",
                  }}
                >
                  Log out of Verba?
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setConfirmingLogout(false)}
                    style={{
                      ...menuItemStyle,
                      flex: 1,
                      textAlign: "center",
                      color: OLIVE_DARK,
                      border: `1px solid ${CREAM_DARK}`,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      closeAll();
                      auth.logout();
                    }}
                    style={{
                      ...menuItemStyle,
                      flex: 1,
                      textAlign: "center",
                      color: CREAM,
                      background: DANGER,
                    }}
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button onClick={() => setOpen((v) => !v)} style={chipStyle}>
        👤{" "}
        {!compact && (
          <span style={{ fontSize: 12, color: OLIVE_DARK }}>Log in</span>
        )}
      </button>
      {open && (
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
