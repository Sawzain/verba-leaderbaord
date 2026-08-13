import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuthContext } from "../AuthContext";
import {
  SAGE_DEEP,
  SAGE_DARK,
  PAPER,
  SAGE,
  INK,
  DANGER,
  LOGO_SRC,
  FONT_SERIF,
} from "../theme";

const inputStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: `1.5px solid ${SAGE}`,
  fontSize: 15,
  fontFamily: FONT_SERIF,
  outline: "none",
  background: PAPER,
  color: INK,
  boxSizing: "border-box",
  width: "100%",
};

// Sits outside the authenticated AppShell, so it keeps its own layout
// language rather than the SAGE-page/PAPER-card shell treatment used
// inside /app — see LandingPage for the same note.
export default function ResetPasswordPage() {
  const auth = useAuthContext();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await auth.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message || "Couldn't reset your password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: FONT_SERIF,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 20px",
      }}
    >
      <img
        src={LOGO_SRC}
        alt="Verba Book Club"
        style={{
          width: 100,
          height: 100,
          objectFit: "cover",
          borderRadius: 14,
          marginBottom: 24,
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: PAPER,
          border: `1px solid ${SAGE}`,
          borderRadius: 12,
          padding: "24px 20px",
        }}
      >
        {!token && (
          <div style={{ fontSize: 14, color: DANGER }}>
            This reset link is missing its token. Please use the link from your
            email, or request a new one from the login screen.
          </div>
        )}

        {token && done && (
          <div>
            <div style={{ fontSize: 15, color: INK, marginBottom: 12 }}>
              Your password has been reset.
            </div>
            <Link to="/app/reviews" style={{ fontSize: 14, color: SAGE_DEEP }}>
              Continue to log in
            </Link>
          </div>
        )}

        {token && !done && (
          <div>
            <div
              style={{
                fontSize: 15,
                color: INK,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Choose a new password
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password (min. 8 characters)"
                style={inputStyle}
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Confirm new password"
                style={inputStyle}
              />
              {error && (
                <div style={{ fontSize: 13, color: DANGER }}>{error}</div>
              )}
              <button
                onClick={submit}
                disabled={busy}
                style={{
                  marginTop: 4,
                  background: SAGE_DARK,
                  color: PAPER,
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 18px",
                  fontSize: 15,
                  cursor: busy ? "default" : "pointer",
                  opacity: busy ? 0.7 : 1,
                  fontFamily: FONT_SERIF,
                }}
              >
                {busy ? "Saving…" : "Reset password"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
