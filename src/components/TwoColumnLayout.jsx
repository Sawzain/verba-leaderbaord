// Generic main+sidebar shell for routes opted into AppShell's wide layout
// (see WIDE_LAYOUT_ROUTES). Sidebar items are expected to be self-contained
// cards (own background/padding/radius) — this just handles the two-column
// split and the stack-on-narrow-viewport fallback.
export default function TwoColumnLayout({ main, sidebar }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "3 1 480px", minWidth: 0 }}>{main}</div>
      <div
        style={{
          flex: "1 1 300px",
          minWidth: 280,
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {sidebar}
      </div>
    </div>
  );
}
