import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../AuthContext";
import AuthPanel from "./AuthPanel";
import {
  SAGE_DEEP,
  PAPER,
  MUTED,
  CLAY,
  DANGER,
  AVATAR_COLORS,
  SAGE_TINT,
  FONT_SANS,
} from "../theme";

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
  color: PAPER,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: "bold",
  border: `2px solid ${PAPER}`,
  boxSizing: "border-box",
  cursor: "pointer",
  flexShrink: 0,
});

const chipStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 8,
  background: SAGE_TINT,
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
  fontFamily: FONT_SANS,
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
      <div
        ref={wrapRef}
        className="verba-account-wrap"
        style={{ position: "relative" }}
      >
        <button
          className="verba-account-chip"
          onClick={() => setOpen((v) => !v)}
          style={{
            ...chipStyle,
            background: "none",
            borderRadius: 999,
            padding: compact ? 0 : "4px 10px 4px 4px",
          }}
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
                border: `2px solid ${PAPER}`,
                boxSizing: "border-box",
                flexShrink: 0,
              }}
            />
          ) : (
            <div style={avatarBtnStyle(name, size)}>{initials(name)}</div>
          )}
          {!compact && (
            <span
              className="verba-chip-label"
              style={{
                fontSize: 12,
                color: SAGE_DEEP,
                fontFamily: FONT_SANS,
                whiteSpace: "nowrap",
                maxWidth: 110,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {name}
            </span>
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
              background: PAPER,
              borderRadius: 12,
              padding: 10,
              boxShadow: "0 10px 30px rgba(45,51,39,0.2)",
              textAlign: "left",
            }}
          >
            {!confirmingLogout ? (
              <>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: SAGE_DEEP,
                    padding: "4px 8px 8px",
                    borderBottom: "1px solid rgba(45,51,39,0.1)",
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
                    style={{ ...menuItemStyle, color: SAGE_DEEP }}
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
                    color: SAGE_DEEP,
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
                      color: SAGE_DEEP,
                      border: "1px solid rgba(45,51,39,0.15)",
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
                      color: PAPER,
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
    <div
      ref={wrapRef}
      className="verba-account-wrap"
      style={{ position: "relative" }}
    >
      <button
        className="verba-account-chip"
        onClick={() => setOpen((v) => !v)}
        style={chipStyle}
      >
        <svg
          width={size - 8}
          height={size - 8}
          viewBox="0 0 24 24"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <circle cx="12" cy="8" r="4" stroke={SAGE_DEEP} strokeWidth="2" />
          <path
            d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
            stroke={SAGE_DEEP}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {!compact && (
          <span
            className="verba-chip-label"
            style={{
              fontSize: 12,
              color: SAGE_DEEP,
              fontFamily: FONT_SANS,
            }}
          >
            Log in
          </span>
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
            background: PAPER,
            borderRadius: 12,
            padding: 14,
            boxShadow: "0 10px 30px rgba(45,51,39,0.2)",
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
