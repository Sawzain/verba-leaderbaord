import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuthContext } from "../AuthContext";
import { OLIVE_DARK, CREAM, CREAM_DARK, WHITE, LOGO_SRC } from "../theme";

const inputStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: `1.5px solid ${CREAM_DARK}`,
  fontSize: 15,
  fontFamily: "'Georgia', serif",
  outline: "none",
  background: WHITE,
  color: "#2d2d2d",
  boxSizing: "border-box",
  width: "100%",
};

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
        fontFamily: "'Georgia', serif",
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
          background: "#f6f3e8",
          border: `1px solid ${CREAM_DARK}`,
          borderRadius: 12,
          padding: "24px 20px",
        }}
      >
        {!token && (
          <div style={{ fontSize: 14, color: "#a33" }}>
            This reset link is missing its token. Please use the link from your
            email, or request a new one from the login screen.
          </div>
        )}

        {token && done && (
          <div>
            <div style={{ fontSize: 15, color: "#2d2d2d", marginBottom: 12 }}>
              Your password has been reset.
            </div>
            <Link to="/app/reviews" style={{ fontSize: 14, color: OLIVE_DARK }}>
              Continue to log in
            </Link>
          </div>
        )}

        {token && !done && (
          <div>
            <div
              style={{
                fontSize: 15,
                color: "#2d2d2d",
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
                <div style={{ fontSize: 13, color: "#a33" }}>{error}</div>
              )}
              <button
                onClick={submit}
                disabled={busy}
                style={{
                  marginTop: 4,
                  background: "#6B7A3A",
                  color: CREAM,
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 18px",
                  fontSize: 15,
                  cursor: busy ? "default" : "pointer",
                  opacity: busy ? 0.7 : 1,
                  fontFamily: "'Georgia', serif",
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
