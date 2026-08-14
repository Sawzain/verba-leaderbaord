import { NavLink } from "react-router-dom";
import { SAGE_DEEP, SAGE_DARK, FONT_MONO } from "../theme";

// Simple mono-caps nav links, underlined when active. Replaces the old
// pill-nav pill background + the separate floating "stuck" duplicate that
// appeared on scroll — the top bar is now always visible in normal flow,
// so that duplicate isn't needed.
const TABS = [
  { to: "/app/reviews", label: "Reviews" },
  { to: "/app/leaderboard", label: "Leaderboard" },
  { to: "/app/quotes", label: "Verba Wall" },
  { to: "/app/manage", label: "Manage" },
];

const tabLinkStyle = ({ isActive }) => ({
  fontFamily: FONT_MONO,
  fontSize: 12.5,
  letterSpacing: "0.75px",
  textTransform: "uppercase",
  textDecoration: "none",
  color: isActive ? SAGE_DEEP : SAGE_DARK,
  fontWeight: isActive ? 700 : 600,
  paddingBottom: 6,
  borderBottom: isActive ? `2px solid ${SAGE_DEEP}` : "2px solid transparent",
  whiteSpace: "nowrap",
});

export default function TabSwitcher({ isAdmin }) {
  const visibleTabs = isAdmin
    ? TABS
    : TABS.filter((t) => t.to !== "/app/manage");

  return (
    <div
      className="verba-tabs"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        flexWrap: "wrap",
      }}
    >
      {visibleTabs.map(({ to, label }) => (
         <NavLink key={to} to={to} className="verba-tab-link" style={tabLinkStyle}>
          {label}
        </NavLink>
      ))}
    </div>
  );
}
