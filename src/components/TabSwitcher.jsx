import { NavLink } from "react-router-dom";
import { OLIVE_DARK, CREAM, CREAM_DARK } from "../theme";

const TABS = [
  { to: "/app/leaderboard", label: "Leaderboard" },
  { to: "/app/reviews", label: "Book Review" },
  { to: "/app/quotes", label: "Verba Wall" },
  { to: "/app/manage", label: "Manage" },
];

export default function TabSwitcher() {
  return (
    <div style={{ position: "relative", width: "100%", marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          gap: 6,
          background: OLIVE_DARK,
          padding: "6px",
          borderRadius: 12,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          maxWidth: "100%",
          minWidth: 0,
        }}
      >
      {TABS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontFamily: "'Georgia', serif",
            textDecoration: "none",
            background: isActive ? CREAM : "transparent",
            color: isActive ? OLIVE_DARK : CREAM_DARK,
            fontWeight: isActive ? "bold" : "normal",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            whiteSpace: "nowrap",
            flexShrink: 0,
          })}
        >
          {label}
        </NavLink>
      ))}
      </div>
      {/* Fades the right edge so a scrollable tab bar (e.g. "Manage" cut
          off on narrow phones) visually hints there's more to scroll to,
          without needing JS scroll-position tracking. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 28,
          borderRadius: "0 12px 12px 0",
          background: `linear-gradient(to right, transparent, ${OLIVE_DARK})`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
