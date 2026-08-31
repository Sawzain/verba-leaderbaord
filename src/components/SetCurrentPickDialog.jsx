import { useState } from "react";
import { SAGE_DEEP, SAGE_DARK, PAPER, MUTED, FONT_SERIF } from "../theme";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Shown when an admin sets a book as the current pick — lets them
// backdate when the pick actually started (defaults to today), so
// "picked X days ago" on CurrentPickPreview reflects reality instead of
// always being pinned to whenever the toggle happened to be clicked.
export default function SetCurrentPickDialog({ bookTitle, onConfirm, onCancel }) {
  const [date, setDate] = useState(todayISO());

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,20,20,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: 16,
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: PAPER,
          borderRadius: 14,
          padding: 22,
          width: "100%",
          maxWidth: 340,
          boxShadow: "0 10px 30px rgba(45,51,39,0.25)",
        }}
      >
        <div
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 18,
            color: SAGE_DEEP,
            marginBottom: 6,
          }}
        >
          Set as current pick
        </div>
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>
          When did the club start reading "{bookTitle}"? Defaults to today —
          backdate it if you're catching this up after the fact.
        </div>

        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 12px",
            borderRadius: 10,
            border: `1.5px solid ${MUTED}`,
            fontSize: 14,
            fontFamily: FONT_SERIF,
            outline: "none",
            background: PAPER,
            color: SAGE_DEEP,
            boxSizing: "border-box",
            marginBottom: 18,
          }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 10,
              border: `1px solid ${MUTED}`,
              background: "none",
              color: SAGE_DEEP,
              fontSize: 14,
              fontFamily: FONT_SERIF,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(date)}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 10,
              border: "none",
              background: SAGE_DARK,
              color: PAPER,
              fontSize: 14,
              fontFamily: FONT_SERIF,
              cursor: "pointer",
            }}
          >
            Set pick
          </button>
        </div>
      </div>
    </div>
  );
}
