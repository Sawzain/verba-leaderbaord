import { useState } from "react";
import {
  SAGE_DEEP,
  SAGE,
  PAPER,
  MUTED,
  DANGER,
  INK,
  FONT_SANS,
} from "../theme";

const inputStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  fontSize: 15,
  fontFamily: FONT_SANS,
  outline: "none",
  background: PAPER,
  color: INK,
  boxSizing: "border-box",
  width: "100%",
};

export default function AuthPanel({
  authError,
  setAuthError,
  authBusy,
  onRegister,
  onLogin,
  onForgotPassword,
  discordLoginUrl,
}) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotMessage, setForgotMessage] = useState(null);

  const submit = () => {
    if (mode === "register") {
      onRegister(name.trim(), email.trim(), password);
    } else {
      onLogin(email.trim(), password);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setAuthError(null);
    setForgotMessage(null);
  };

  const submitForgot = async () => {
    if (!forgotEmail.trim()) return;
    setForgotBusy(true);
    setForgotMessage(null);
    try {
      const message = await onForgotPassword(forgotEmail.trim());
      setForgotMessage(message);
    } catch (err) {
      setForgotMessage(
        err.message || "Something went wrong. Please try again.",
      );
    } finally {
      setForgotBusy(false);
    }
  };

  if (mode === "forgot") {
    return (
      <div
        style={{
          background: SAGE,
          borderRadius: 12,
          padding: "18px 16px",
        }}
      >
        <div style={{ fontSize: 14, color: SAGE_DEEP, marginBottom: 12 }}>
          Enter your account email and we'll send a link to reset your password.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitForgot()}
            placeholder="Your account email"
            style={inputStyle}
          />
          {forgotMessage && (
            <div style={{ fontSize: 13, color: SAGE_DEEP }}>
              {forgotMessage}
            </div>
          )}
          <button
            className="verba-btn"
            onClick={submitForgot}
            disabled={forgotBusy}
            style={{
              marginTop: 4,
              background: SAGE_DEEP,
              color: PAPER,
              border: "none",
              borderRadius: 10,
              padding: "10px 18px",
              fontSize: 15,
              cursor: forgotBusy ? "default" : "pointer",
              opacity: forgotBusy ? 0.7 : 1,
              fontFamily: FONT_SANS,
              fontWeight: 600,
            }}
          >
            {forgotBusy ? "Sending…" : "Send reset link"}
          </button>
          <button
            onClick={() => switchMode("login")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              marginTop: 4,
              fontFamily: FONT_SANS,
              fontSize: 13,
              color: SAGE_DEEP,
              textDecoration: "underline",
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            ← Back to log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: SAGE,
        borderRadius: 12,
        padding: "18px 16px",
      }}
    >
      <a
        href={discordLoginUrl}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: "#5865F2",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "10px 18px",
          fontSize: 14,
          fontFamily: FONT_SANS,
          fontWeight: 600,
          textDecoration: "none",
          marginBottom: 14,
        }}
      >
        Continue with Discord
      </a>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          color: MUTED,
          fontSize: 12,
        }}
      >
        <div
          style={{ flex: 1, height: 1, background: "rgba(45,51,39,0.15)" }}
        />
        or use email
        <div
          style={{ flex: 1, height: 1, background: "rgba(45,51,39,0.15)" }}
        />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        <button
          onClick={() => switchMode("login")}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: FONT_SANS,
            fontSize: 14,
            cursor: "pointer",
            color: mode === "login" ? SAGE_DEEP : MUTED,
            fontWeight: mode === "login" ? 700 : 500,
            borderBottom:
              mode === "login"
                ? `2px solid ${SAGE_DEEP}`
                : "2px solid transparent",
            paddingBottom: 4,
          }}
        >
          Log in
        </button>
        <button
          onClick={() => switchMode("register")}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: FONT_SANS,
            fontSize: 14,
            cursor: "pointer",
            color: mode === "register" ? SAGE_DEEP : MUTED,
            fontWeight: mode === "register" ? 700 : 500,
            borderBottom:
              mode === "register"
                ? `2px solid ${SAGE_DEEP}`
                : "2px solid transparent",
            paddingBottom: 4,
          }}
        >
          Create account
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {mode === "register" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={inputStyle}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={
              mode === "register" ? "Password (min. 8 characters)" : "Password"
            }
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            title={showPassword ? "Hide password" : "Show password"}
            style={{
              border: "none",
              background: PAPER,
              borderRadius: 10,
              width: 42,
              flexShrink: 0,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>
        {mode === "login" && (
          <button
            onClick={() => switchMode("forgot")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: SAGE_DEEP,
              textDecoration: "underline",
              cursor: "pointer",
              alignSelf: "flex-end",
            }}
          >
            Forgot password?
          </button>
        )}
        {authError && (
          <div style={{ fontSize: 13, color: DANGER }}>{authError}</div>
        )}
        <button
          className="verba-btn"
          onClick={submit}
          disabled={authBusy}
          style={{
            marginTop: 4,
            background: SAGE_DEEP,
            color: PAPER,
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 15,
            cursor: authBusy ? "default" : "pointer",
            opacity: authBusy ? 0.7 : 1,
            fontFamily: FONT_SANS,
            fontWeight: 600,
          }}
        >
          {authBusy
            ? "Please wait…"
            : mode === "register"
              ? "Create account"
              : "Log in"}
        </button>
      </div>
    </div>
  );
}
