import { useEffect, useRef, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { OLIVE_DARK, CREAM, CREAM_DARK, LOGO_SRC } from "../theme";
import AccountChip from "./AccountChip";

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
  outline: "none",
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

const pillWrapStyle = {
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
};

function Tabs({ tabs }) {
  const scrollRef = useRef(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 2);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
    <div
      style={{ position: "relative", width: "fit-content", maxWidth: "100%" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div ref={scrollRef} style={pillWrapStyle}>
          {tabs.map(({ to, label }) => (
            <NavLink key={to} to={to} style={tabPillStyle}>
              {label}
            </NavLink>
          ))}
        </div>
        <AccountChip />
      </div>
      {canScrollRight && (
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
      )}
    </div>
  );
}

export default function TabSwitcher({ isAdmin }) {
  const visibleTabs = isAdmin
    ? TABS
    : TABS.filter((t) => t.to !== "/app/manage");

  // Past ~140px of scroll, the original tab bar has scrolled out of
  // comfortable reach — show a small fixed copy (logo + same pill) so
  // switching tabs never requires scrolling back to the top. Always
  // rendered once past the threshold; `stuck` toggles a fade+slide via
  // opacity/transform rather than mounting/unmounting, so it eases in
  // instead of popping.
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 140);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Reserves the sticky bar's height in normal flow once it's fixed,
          so it stops floating over content underneath instead of pushing
          nothing out of the way. */}
      <div
        style={{ height: stuck ? 68 : 0, transition: "height 0.15s ease" }}
      />
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          pointerEvents: stuck ? "auto" : "none",
          opacity: stuck ? 1 : 0,
          transform: stuck ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: OLIVE_DARK,
            padding: "8px 10px",
            borderRadius: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            pointerEvents: "auto",
            maxWidth: "calc(100vw - 24px)",
          }}
        >
          <Link
            to="/"
            aria-label="Back to Verba Book Club home"
            style={{ display: "flex", flexShrink: 0 }}
          >
            <img
              src={LOGO_SRC}
              alt="Verba Book Club"
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                borderRadius: 10,
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
              flex: "1 1 auto",
              minWidth: 0,
            }}
          >
            {visibleTabs.map(({ to, label }) => (
              <NavLink key={to} to={to} style={tabPillStyle}>
                {label}
              </NavLink>
            ))}
          </div>
          <AccountChip compact />
        </div>
      </div>
      <div
        style={{
          width: "fit-content",
          maxWidth: "100%",
          margin: "0 auto 20px",
        }}
      >
        <Tabs tabs={visibleTabs} />
      </div>
    </>
  );
}
