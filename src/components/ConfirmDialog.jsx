import { useUIFeedbackContext } from "../UIFeedbackContext";
import {
  SAGE_DEEP,
  PAPER,
  MUTED,
  DANGER,
  FONT_SERIF,
  FONT_SANS,
} from "../theme";

// Replaces window.confirm(). Mounted once in App.jsx; renders nothing
// until useConfirm()'s promise is pending.
export default function ConfirmDialog() {
  const { confirmState, resolveConfirm } = useUIFeedbackContext();

  if (!confirmState) return null;

  return (
    <div
      onClick={() => resolveConfirm(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(45,51,39,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="verba-fade-in"
        style={{
          background: PAPER,
          borderRadius: 14,
          padding: "24px 22px",
          maxWidth: 360,
          width: "100%",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 17,
            color: SAGE_DEEP,
            lineHeight: 1.5,
            marginBottom: 20,
          }}
        >
          {confirmState.message}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            className="verba-btn"
            onClick={() => resolveConfirm(false)}
            style={{
              background: "none",
              border: `1.5px solid ${MUTED}`,
              borderRadius: 10,
              padding: "9px 18px",
              fontSize: 14,
              fontFamily: FONT_SANS,
              color: SAGE_DEEP,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            className="verba-btn"
            onClick={() => resolveConfirm(true)}
            style={{
              background: DANGER,
              border: "none",
              borderRadius: 10,
              padding: "9px 18px",
              fontSize: 14,
              fontFamily: FONT_SANS,
              fontWeight: 600,
              color: PAPER,
              cursor: "pointer",
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
