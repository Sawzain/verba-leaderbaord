import { useUIFeedbackContext } from "../UIFeedbackContext";
import { SAGE_DEEP, PAPER, DANGER, FONT_SANS } from "../theme";

// Replaces window.alert(). Mounted once in App.jsx; auto-dismisses after
// 4s (see useUIFeedback), or on click of the × button.
export default function Toast() {
  const { toast, dismissToast } = useUIFeedbackContext();

  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1100,
        maxWidth: "min(420px, calc(100vw - 32px))",
      }}
    >
      <div
        className="verba-fade-in"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: isError ? DANGER : SAGE_DEEP,
          color: PAPER,
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: 14,
          fontFamily: FONT_SANS,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        <span style={{ flex: 1 }}>{toast.message}</span>
        <button
          onClick={dismissToast}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "none",
            color: PAPER,
            cursor: "pointer",
            fontSize: 16,
            opacity: 0.85,
            padding: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
