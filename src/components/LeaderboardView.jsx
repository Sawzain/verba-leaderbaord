import { useEffect, useMemo, useState } from "react";
import {
  SAGE,
  SAGE_DARK,
  SAGE_DEEP,
  PAPER,
  MUTED,
  CLAY,
  SAGE_TINT,
  FONT_SERIF,
  FONT_SANS,
  FONT_MONO,
} from "../theme";
import Pagination from "./Pagination";
import useSlowLoadHint from "../hooks/useSlowLoadHint";
import EmptyState from "./EmptyState";
import MemberPreviewCard from "./MemberPreviewCard";
import { Link } from "react-router-dom";
import { API_ROOT } from "../hooks/useMembers";

const PAGE_SIZE = 10;

export default function LeaderboardView({
  sorted,
  memberCount,
  loading,
  totalBooksRead = 0,
  totalQuotes = 0,
}) {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [page, setPage] = useState(1);
  const showSlowHint = useSlowLoadHint(loading);

  const [previewId, setPreviewId] = useState(null);
  const [previewCache, setPreviewCache] = useState({});
  const fetchPreview = (id) => {
    if (previewCache[id]) return;
    fetch(`${API_ROOT}/members/${id}/profile`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPreviewCache((prev) => ({ ...prev, [id]: data }));
      })
      .catch(() => {});
  };

  const visible = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter((m) => m.name.toLowerCase().includes(q));
  }, [sorted, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [visible, safePage],
  );

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
    <div style={{ background: PAPER, padding: 24, borderRadius: 16, border: "1px solid rgba(45,51,39,0.08)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ fontFamily: FONT_SERIF, fontSize: 28, color: SAGE_DEEP }}>
          Reading leaderboard
        </div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: SAGE_DARK,
            letterSpacing: "0.5px",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span>
            {memberCount} MEMBER{memberCount !== 1 ? "S" : ""}
          </span>
          <span>·</span>
          <span>
            {totalBooksRead} BOOK{totalBooksRead !== 1 ? "S" : ""} READ
          </span>
          <span>·</span>
          <span>{totalQuotes} ON THE WALL</span>
          {memberCount > 5 && !searchOpen && (
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search readers"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke={SAGE_DARK}
                  strokeWidth="2"
                />
                <line
                  x1="16.5"
                  y1="16.5"
                  x2="21"
                  y2="21"
                  stroke={SAGE_DARK}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {memberCount > 5 && searchOpen && (
        <div style={{ marginBottom: 12 }}>
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => {
              if (!search.trim()) setSearchOpen(false);
            }}
            placeholder="Search readers…"
            style={{
              width: "100%",
              padding: "9px 14px",
              borderRadius: 10,
              border: "none",
              fontSize: 13,
              fontFamily: FONT_SANS,
              outline: "none",
              background: PAPER,
              color: SAGE_DEEP,
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {loading && (
        <div style={{ padding: 40, textAlign: "center", color: SAGE_DARK }}>
          <div
            style={{
              width: 28,
              height: 28,
              margin: "0 auto 14px",
              border: `3px solid ${PAPER}`,
              borderTopColor: SAGE_DARK,
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

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pageItems.map((member, i) => {
          const displayRank = ranks.get(member._id);
          const isFirstPlace = displayRank === 1;

          return (
            <div
              key={member._id}
              className="verba-fade-in"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderRadius: 10,
                borderBottom: "1px solid rgba(45,51,39,0.07)",
                animationDelay: `${i * 25}ms`,
                position: "relative",
                zIndex: previewId === member._id ? 60 : "auto",
              }}
            >
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 12,
                  color: SAGE_DARK,
                  width: 22,
                  flexShrink: 0,
                }}
              >
                {String(displayRank).padStart(2, "0")}
              </span>

              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <Link
                  to={`/app/members/${member._id}`}
                  onMouseEnter={() => {
                    setPreviewId(member._id);
                    fetchPreview(member._id);
                  }}
                  onMouseLeave={() => setPreviewId(null)}
                  onClick={(e) => {
                    if (previewId !== member._id && "ontouchstart" in window) {
                      e.preventDefault();
                      setPreviewId(member._id);
                      fetchPreview(member._id);
                    }
                  }}
                  style={{
                    fontSize: 15,
                    color: SAGE_DEEP,
                    fontFamily: FONT_SERIF,
                    fontWeight: isFirstPlace ? 600 : 500,
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  {member.name}
                </Link>
                {previewId === member._id && (
                  <MemberPreviewCard
                    profile={previewCache[member._id]}
                    loading={!previewCache[member._id]}
                  />
                )}
                {member.latestActivity && (
                  <div
                    style={{ fontSize: 11, color: MUTED, fontStyle: "italic" }}
                  >
                    {member.latestActivity.type === "review"
                      ? "reviewed "
                      : "finished "}
                    {member.latestActivity.bookTitle || "a book"}
                  </div>
                )}
              </div>

              <div
                style={{
                  background: isFirstPlace ? CLAY : SAGE_TINT,
                  color: isFirstPlace ? PAPER : SAGE_DEEP,
                  borderRadius: 7,
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  flexShrink: 0,
                }}
              >
                {member.points} BOOK{member.points !== 1 ? "S" : ""}
              </div>
            </div>
          );
        })}
      </div>

      <Pagination page={safePage} totalPages={totalPages} goToPage={setPage} />
    </div>
  );
}
