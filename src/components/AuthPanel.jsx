import { useState } from "react";
import { OLIVE_DARK, CREAM, CREAM_DARK, WHITE } from "../theme";

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

export default function AuthPanel({ authError, setAuthError, authBusy, onRegister, onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
  };

  return (
    <div
      style={{
        background: "#f6f3e8",
        border: `1px solid ${CREAM_DARK}`,
        borderRadius: 12,
        padding: "18px 16px",
      }}
    >
      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        <button
          onClick={() => switchMode("login")}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: "'Georgia', serif",
            fontSize: 14,
            cursor: "pointer",
            color: mode === "login" ? OLIVE_DARK : "#999",
            fontWeight: mode === "login" ? "bold" : "normal",
            borderBottom: mode === "login" ? `2px solid ${OLIVE_DARK}` : "2px solid transparent",
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
            fontFamily: "'Georgia', serif",
            fontSize: 14,
            cursor: "pointer",
            color: mode === "register" ? OLIVE_DARK : "#999",
            fontWeight: mode === "register" ? "bold" : "normal",
            borderBottom: mode === "register" ? `2px solid ${OLIVE_DARK}` : "2px solid transparent",
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
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={mode === "register" ? "Password (min. 8 characters)" : "Password"}
          style={inputStyle}
        />

        {authError && (
          <div style={{ fontSize: 13, color: "#a33" }}>{authError}</div>
        )}

        <button
          onClick={submit}
          disabled={authBusy}
          style={{
            marginTop: 4,
            background: "#6B7A3A",
            color: CREAM,
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 15,
            cursor: authBusy ? "default" : "pointer",
            opacity: authBusy ? 0.7 : 1,
            fontFamily: "'Georgia', serif",
          }}
        >
          {authBusy ? "Please wait…" : mode === "register" ? "Create account" : "Log in"}
        </button>
      </div>
    </div>
  );
}
