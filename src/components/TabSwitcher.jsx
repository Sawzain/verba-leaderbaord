import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { OLIVE_DARK, CREAM, CREAM_DARK, LOGO_SRC } from "../theme";

const TABS = [
  { to: "/app/leaderboard", label: "Leaderboard" },
  { to: "/app/reviews", label: "Book Review" },
  { to: "/app/quotes", label: "Verba Wall" },
  { to: "/app/manage", label: "Manage" },
];

const tabPillStyle = ({ isActive }) => ({
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
});

export default function TabSwitcher() {
  // Past ~140px of scroll, the original tab bar has scrolled out of
  // comfortable reach — switch on a small fixed copy (logo + tabs) so
  // switching tabs never requires scrolling back to the top.
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 140);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {stuck && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            background: OLIVE_DARK,
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}
        >
          <Link to="/" aria-label="Back to Verba Book Club home">
            <img
              src={LOGO_SRC}
              alt="Verba Book Club"
              style={{
                width: 28,
                height: 28,
                objectFit: "cover",
                borderRadius: 6,
                display: "block",
              }}
            />
          </Link>
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              minWidth: 0,
            }}
          >
            {TABS.map(({ to, label }) => (
              <NavLink key={to} to={to} style={tabPillStyle}>
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
      <div
        style={{
          position: "relative",
          width: "fit-content",
          maxWidth: "100%",
          margin: "0 auto 20px",
        }}
      >
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
            <NavLink key={to} to={to} style={tabPillStyle}>
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
    </>
  );
}
