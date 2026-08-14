import { useState } from "react";
import { SAGE_DEEP, FONT_SANS } from "../theme";

// Generic main+sidebar shell for routes opted into AppShell's wide layout
// (see WIDE_LAYOUT_ROUTES). Sidebar items are expected to be self-contained
// cards (own background/padding/radius) — this just handles the two-column
// split and the stack-on-narrow-viewport fallback.
//
// On mobile (<=768px, see index.css) the sidebar collapses behind a
// "Show details" toggle instead of always rendering below the main list —
// the .verba-sidebar-toggle-btn / .verba-two-col-sidebar[data-collapsed]
// rules there are what actually hide/show it; desktop ignores both.
export default function TwoColumnLayout({ main, sidebar }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "3 1 480px", minWidth: 0 }}>
        {main}
        <button
          className="verba-sidebar-toggle-btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          style={{
            width: "100%",
            marginTop: 16,
            padding: "10px 16px",
            borderRadius: 10,
            border: `1px solid ${SAGE_DEEP}`,
            background: "transparent",
            color: SAGE_DEEP,
            fontFamily: FONT_SANS,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {open ? "Hide details ▲" : "Show details ▾"}
        </button>
      </div>
      <div
        className="verba-two-col-sidebar"
        data-collapsed={!open}
        style={{
          flex: "1 1 300px",
          minWidth: 280,
          maxWidth: 340,
          gap: 16,
        }}
      >
        {sidebar}
      </div>
    </div>
  );
}
