import { useEffect, useMemo, useState } from "react";
import {
  OLIVE,
  OLIVE_DARK,
  OLIVE_LIGHT,
  CREAM,
  CREAM_DARK,
  medals,
} from "../theme";
import Pagination from "./Pagination";
import useSlowLoadHint from "../hooks/useSlowLoadHint";
import EmptyState from "./EmptyState";

const PAGE_SIZE = 10;

// Same translucent off-white used for cards on the Quote Wall (CARD_BG in
// QuoteWallView.jsx), so leaderboard rows and quote cards read as one
// consistent visual language.
const ROW_BG = "rgba(255,255,255,0.4)";
const ROW_BG_FIRST = "rgba(255,255,255,0.6)"; // slightly stronger for 1st place

export default function LeaderboardView({
  sorted,
  memberCount,
  loading,
  activity = [],
  totalBooksRead = 0,
  totalQuotes = 0,
}) {
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          padding: "12px 24px",
          fontSize: 13,
          color: OLIVE_DARK,
          borderBottom: `1px solid ${CREAM_DARK}`,
          flexWrap: "wrap",
        }}
      >
        <span>
          <strong>{memberCount}</strong> reader{memberCount !== 1 ? "s" : ""}
        </span>
        <span>·</span>
        <span>
          <strong>{totalBooksRead}</strong> book
          {totalBooksRead !== 1 ? "s" : ""} read
        </span>
        <span>·</span>
        <span>
          <strong>{totalQuotes}</strong> verse{totalQuotes !== 1 ? "s" : ""} on
          the Wall
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
              border: `1px solid ${CREAM_DARK}`,
              fontSize: 13,
              fontFamily: "'Georgia', serif",
              outline: "none",
              background: "rgba(255,255,255,0.75)",
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
        <EmptyState message="No members yet. Add some in Manage!" />
      )}

      {!loading && sorted.length > 0 && visible.length === 0 && (
        <EmptyState message={`No readers match "${search}".`} />
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
                fontSize: isTop3 ? 22 : 16,
                textAlign: "center",
                color: isTop3 ? OLIVE : OLIVE_DARK,
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
              {member.latestActivity && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#8a8a72",
                    fontStyle: "italic",
                    marginTop: 2,
                  }}
                >
                  {member.latestActivity.type === "review"
                    ? "✍️ reviewed "
                    : "📖 finished "}
                  {member.latestActivity.bookTitle || "a book"}
                </div>
              )}
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
                {member.points} book{member.points !== 1 ? "s" : ""} read
              </div>
            </div>
          </div>
        );
      })}

      <Pagination page={safePage} totalPages={totalPages} goToPage={setPage} />
      {activity.length > 0 && (
        <div
          style={{
            margin: "16px 24px",
            background: CREAM,
            borderRadius: 12,
            padding: "16px 18px",
            border: `1px solid ${CREAM_DARK}`,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: OLIVE_DARK,
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: 10,
              fontWeight: "bold",
            }}
          >
            ✨ Recent Activity
          </div>
          {activity.map((a, i) => (
            <div
              key={i}
              style={{
                fontSize: 14,
                color: "#3f4230",
                padding: "5px 0",
                fontFamily: "'Georgia', serif",
              }}
            >
              📖 <strong>{a.memberName}</strong> finished{" "}
              <em>{a.bookTitle || "a book"}</em>
            </div>
          ))}
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
