import { useState } from "react";
import {
  SAGE_DARK,
  SAGE_DEEP,
  PAPER,
  MUTED,
  INK,
  FONT_SERIF,
  SAGE_TINT,
  DANGER,
} from "../theme";
import { API_ROOT } from "../hooks/useMembers";

const inputStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: `1.5px solid ${MUTED}`,
  fontSize: 14,
  fontFamily: FONT_SERIF,
  outline: "none",
  background: PAPER,
  color: INK,
  boxSizing: "border-box",
};

// There's no email service wired up, so this doesn't send anything —
// it generates a fresh temporary password that the admin copies and
// relays to the member directly (Discord DM, in person, etc).
export default function AdminPasswordReset({ token }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const submit = async () => {
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_ROOT}/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Couldn't reset that password");
      setResult(body);
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 13,
          color: SAGE_DEEP,
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Reset a member's password
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Their account email"
          style={{ ...inputStyle, flex: 1, minWidth: 180 }}
        />
        <button
          onClick={submit}
          disabled={busy}
          style={{
            background: SAGE_DARK,
            color: PAPER,
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 14,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.7 : 1,
            fontFamily: FONT_SERIF,
          }}
        >
          {busy ? "Resetting…" : "Reset password"}
        </button>
      </div>

      {error && <div style={{ marginTop: 8, fontSize: 13, color: DANGER }}>{error}</div>}

      {result && (
        <div
          style={{
            marginTop: 10,
            background: SAGE_TINT,
            border: "1px solid rgba(95,115,85,0.3)",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            color: SAGE_DEEP,
          }}
        >
          New temporary password for {result.name} ({result.email}):{" "}
          <strong style={{ fontFamily: "monospace" }}>{result.tempPassword}</strong>
          <div style={{ marginTop: 4, opacity: 0.85 }}>
            Copy this and send it to them directly — it won't be shown again.
          </div>
        </div>
      )}
    </div>
  );
}
