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
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 24,
        background: OLIVE_DARK,
        padding: "4px",
        borderRadius: 12,
      }}
    >
      {TABS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
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
          })}
        >
          {label}
        </NavLink>
      ))}
    </div>
  );
}
