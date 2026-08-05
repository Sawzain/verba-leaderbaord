import { useEffect, useMemo, useState } from "react";
import {
  OLIVE,
  OLIVE_DARK,
  OLIVE_LIGHT,
  CREAM,
  CREAM_DARK,
  medals,
} from "../theme";
import useSlowLoadHint from "../hooks/useSlowLoadHint";

const PAGE_SIZE = 10;

// Same translucent off-white used for cards on the Quote Wall (CARD_BG in
// QuoteWallView.jsx), so leaderboard rows and quote cards read as one
// consistent visual language.
const ROW_BG = "rgba(255,255,255,0.4)";
const ROW_BG_FIRST = "rgba(255,255,255,0.6)"; // slightly stronger for 1st place

export default function LeaderboardView({ sorted, memberCount, loading }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const showSlowHint = useSlowLoadHint(loading);

  const visible = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter((m) => m.name.toLowerCase().includes(q));
  }, [sorted, search]);

  // Search narrows the result set, so whatever page you were on may no
  // longer exist (e.g. you were on page 3, then searched down to 1 result).
  // Reset to page 1 any time the search term changes.
  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [visible, safePage],
  );

  // Competitive ranking ("1224"): tied members share a rank, and the next
  // distinct point total skips ahead accordingly (1, 2, 2, 4 — not 1, 2, 2, 3).
  // Computed once over the full (unfiltered) `sorted` list so a member's
  // rank stays their true standing even while a search narrows what's shown.
  const ranks = useMemo(() => {
    const map = new Map();
    let rank = 0;
    let prevPoints = null;
    sorted.forEach((m, i) => {
      if (m.points !== prevPoints) {
        rank = i + 1;
        prevPoints = m.points;
      }
      map.set(m._id, rank);
    });
    return map;
  }, [sorted]);

  return (
    <div>
      <div
        style={{
          background: OLIVE_LIGHT,
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${CREAM_DARK}`,
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: CREAM,
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          📚 Book of the Month
        </span>
        <span style={{ fontSize: 13, color: CREAM, fontStyle: "italic" }}>
          1 pt per book read
        </span>
      </div>

      {memberCount > 5 && (
        <div style={{ padding: "12px 24px 14px" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search readers…"
            style={{
              width: "100%",
              padding: "7px 12px",
              borderRadius: 8,
              border: "none",
              fontSize: 13,
              fontFamily: "'Georgia', serif",
              outline: "none",
              background: `${CREAM_DARK}55`,
              color: "#3f4230",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {loading && (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "#aaa",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              margin: "0 auto 14px",
              border: `3px solid ${CREAM_DARK}`,
              borderTopColor: OLIVE,
              borderRadius: "50%",
              animation: "verba-spin 0.8s linear infinite",
            }}
          />
          <div style={{ fontStyle: "italic" }}>Loading leaderboard…</div>
          {showSlowHint && (
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
              Still on it — this is taking longer than usual, but hang tight.
            </div>
          )}
        </div>
      )}

      {!loading && sorted.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "#aaa",
            fontStyle: "italic",
          }}
        >
          No members yet. Add some in Manage!
        </div>
      )}

      {!loading && sorted.length > 0 && visible.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "#aaa",
            fontStyle: "italic",
          }}
        >
          No readers match "{search}".
        </div>
      )}

      {pageItems.map((member) => {
        const displayRank = ranks.get(member._id);
        const isTop3 = displayRank <= 3;
        const isFirstPlace = displayRank === 1;

        return (
          <div
            key={member._id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 24px",
              borderBottom: `1px solid ${CREAM}`,
              background: isFirstPlace ? ROW_BG_FIRST : ROW_BG,
              transition: "background 0.2s",
            }}
          >
            <div
              style={{
                width: 36,
                fontSize: isTop3 ? 22 : 14,
                textAlign: "center",
                color: OLIVE,
                fontWeight: "bold",
                flexShrink: 0,
              }}
            >
              {isTop3 ? medals[displayRank - 1] || displayRank : displayRank}
            </div>

            <div style={{ flex: 1, paddingLeft: 12 }}>
              <div
                style={{
                  fontSize: 17,
                  color: OLIVE_DARK,
                  fontFamily: "'Georgia', serif",
                  fontWeight: isFirstPlace ? "bold" : "normal",
                }}
              >
                {member.name}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  background: OLIVE,
                  color: CREAM,
                  borderRadius: 20,
                  padding: "4px 14px",
                  fontSize: 14,
                  fontWeight: "bold",
                  letterSpacing: "0.5px",
                }}
              >
                {member.points} pt{member.points !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        );
      })}

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            padding: "14px 24px",
            borderTop: `1px solid ${CREAM_DARK}`,
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="verba-nav-btn"
            style={{
              background: "none",
              border: `1.5px solid ${CREAM_DARK}`,
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 13,
              fontFamily: "'Georgia', serif",
              color: safePage === 1 ? "#bbb" : OLIVE_DARK,
              cursor: safePage === 1 ? "default" : "pointer",
            }}
          >
            ← Prev
          </button>
          <span style={{ fontSize: 13, color: "#888" }}>
            Page {safePage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="verba-nav-btn"
            style={{
              background: "none",
              border: `1.5px solid ${CREAM_DARK}`,
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 13,
              fontFamily: "'Georgia', serif",
              color: safePage === totalPages ? "#bbb" : OLIVE_DARK,
              cursor: safePage === totalPages ? "default" : "pointer",
            }}
          >
            Next →
          </button>
        </div>
      )}

      <div
        style={{
          padding: "12px 24px",
          background: OLIVE_LIGHT,
          textAlign: "center",
          fontSize: 12,
          color: CREAM,
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        {memberCount} reader{memberCount !== 1 ? "s" : ""} · Verba Book Club
      </div>
    </div>
  );
}
