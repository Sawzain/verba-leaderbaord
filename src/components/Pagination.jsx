import { OLIVE_DARK, OLIVE_LIGHT, CREAM } from "../theme";

// Builds a compact page list with ellipsis gaps, e.g. [1, "…", 4, 5, 6, 7, 8, "…", 24]
// Always keeps first, last, and a small window around the current page so it
// stays readable even with dozens of pages.
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
    borderRadius: 999,
    border: `1px solid ${OLIVE_LIGHT}`,
    background: disabled ? "transparent" : OLIVE_DARK,
    color: disabled ? OLIVE_LIGHT : CREAM,
    fontSize: 12.5,
    fontFamily: "'Georgia', serif",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}

function pageNumberStyle(isCurrent) {
  return {
    minWidth: 28,
    height: 28,
    padding: "0 6px",
    borderRadius: 999,
    border: `1px solid ${isCurrent ? OLIVE_DARK : OLIVE_LIGHT}`,
    background: isCurrent ? OLIVE_DARK : "transparent",
    color: isCurrent ? CREAM : OLIVE_DARK,
    fontSize: 12.5,
    fontWeight: isCurrent ? "bold" : "normal",
    fontFamily: "'Georgia', serif",
    cursor: isCurrent ? "default" : "pointer",
  };
}

// Shared numbered pagination with Prev/Next, used by BooksView,
// LeaderboardView, and QuoteWallView. `goToPage` receives the target page
// number directly (not an updater function) — callers using setState should
// pass `goToPage={(p) => setPage(p)}` rather than `setPage` directly if they
// need extra logic, or just `goToPage={setPage}` if not.
export default function Pagination({ page, totalPages, goToPage }) {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        marginTop: 24,
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

      {getPageNumbers(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            style={{ padding: "0 4px", fontSize: 12.5, color: OLIVE_LIGHT }}
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
        )
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