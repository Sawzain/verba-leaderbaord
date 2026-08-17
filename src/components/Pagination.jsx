import { useEffect, useState } from "react";
import { SAGE_DARK, MUTED, PAPER, CLAY } from "../theme";

const WIDE_BREAKPOINT = 900;

function getPageNumbers(current, total, siblings = 1) {
  const pages = [];
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);

  pages.push(1);
  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("…");
  if (total > 1) pages.push(total);

  return pages;
}

function pageButtonStyle(disabled) {
  return {
    padding: "6px 14px",
    borderRadius: 8,
    border: "none",
    background: disabled ? "transparent" : PAPER,
    color: disabled ? MUTED : SAGE_DARK,
    fontSize: 12.5,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 600,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}

function pageNumberStyle(isCurrent) {
  return {
    minWidth: 28,
    height: 28,
    padding: "0 6px",
    borderRadius: 8,
    border: "none",
    background: isCurrent ? CLAY : "transparent",
    color: isCurrent ? PAPER : SAGE_DARK,
    fontSize: 12.5,
    fontWeight: isCurrent ? 700 : 500,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    cursor: isCurrent ? "default" : "pointer",
  };
}

// Uses more sibling page numbers on wide viewports, since there's room —
// mobile stays tight (current ±1) so the row doesn't wrap awkwardly.
function useResponsiveSiblings() {
  const [siblings, setSiblings] = useState(
    typeof window !== "undefined" && window.innerWidth >= WIDE_BREAKPOINT
      ? 2
      : 1,
  );

  useEffect(() => {
    const update = () =>
      setSiblings(window.innerWidth >= WIDE_BREAKPOINT ? 2 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return siblings;
}

export default function Pagination({ page, totalPages, goToPage }) {
  const siblings = useResponsiveSiblings();
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        marginTop: 16,
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        style={pageButtonStyle(page <= 1)}
      >
        ← Prev
      </button>

      {getPageNumbers(page, totalPages, siblings).map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            style={{ padding: "0 4px", fontSize: 12.5, color: MUTED }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goToPage(p)}
            disabled={p === page}
            style={pageNumberStyle(p === page)}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        style={pageButtonStyle(page >= totalPages)}
      >
        Next →
      </button>
    </div>
  );
}
