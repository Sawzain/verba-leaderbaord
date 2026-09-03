import { useState } from "react";
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
import { SkeletonMemberRow } from "./Skeleton";
import { Link } from "react-router-dom";
import { API_ROOT } from "../hooks/useMembers";

export default function LeaderboardView({
  members,
  total,
  page,
  totalPages,
  goToPage,
  loading,
  totalBooksRead = 0,
  totalQuotes = 0,
  search,
  setSearch,
}) {
  const [searchOpen, setSearchOpen] = useState(search.trim() !== "");
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

  return (
    <div
      style={{
        background: PAPER,
        padding: 24,
        borderRadius: 16,
        border: "1px solid rgba(45,51,39,0.08)",
      }}
    >
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            className="verba-lb-title"
            style={{ fontFamily: FONT_SERIF, fontSize: 28, color: SAGE_DEEP }}
          >
            Reading leaderboard
          </div>
          {total > 5 && !searchOpen && (
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
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
        <div
          className="verba-stats-line"
          style={{
            fontFamily: FONT_MONO,
            fontSize: 13,
            color: SAGE_DARK,
            letterSpacing: "0.5px",
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
            rowGap: 4,
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>
            {total} MEMBER{total !== 1 ? "S" : ""}
            <span aria-hidden="true" style={{ margin: "0 8px" }}>
              ·
            </span>
            {totalBooksRead} BOOK{totalBooksRead !== 1 ? "S" : ""} READ
          </span>
          <span style={{ whiteSpace: "nowrap" }}>
            <span aria-hidden="true" style={{ margin: "0 8px 0 0" }}>
              ·
            </span>
            {totalQuotes} ON THE WALL
          </span>
        </div>
      </div>

      {total > 5 && searchOpen && (
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
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonMemberRow key={i} />
            ))}
          </div>
          {showSlowHint && (
            <div
              style={{
                marginTop: 14,
                textAlign: "center",
                fontSize: 13,
                color: SAGE_DARK,
                opacity: 0.85,
              }}
            >
              Still on it — this is taking longer than usual, but hang tight.
            </div>
          )}
        </div>
      )}

      {!loading && total === 0 && (
        <EmptyState message="No members yet. Add some in Manage!" />
      )}

      {!loading && total > 0 && members.length === 0 && search.trim() && (
        <EmptyState message={`No readers match "${search}".`} />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {members.map((member, i) => {
          const displayRank = member.rank;
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
                className="verba-rank-num"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 13,
                  fontWeight: 600,
                  color: SAGE_DEEP,
                  width: 24,
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
                  className="verba-member-name"
                  style={{
                    fontSize: 17,
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
                    style={{ fontSize: 13, color: MUTED, fontStyle: "italic" }}
                  >
                    {member.latestActivity.type === "review"
                      ? "reviewed "
                      : "finished "}
                    {member.latestActivity.bookTitle || "a book"}
                  </div>
                )}
              </div>

              <div
                className="verba-points-badge"
                style={{
                  background: isFirstPlace ? CLAY : `${SAGE}66`,
                  color: isFirstPlace ? PAPER : SAGE_DEEP,
                  borderRadius: 7,
                  padding: "6px 13px",
                  fontSize: 13,
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

      <Pagination page={page} totalPages={totalPages} goToPage={goToPage} />
    </div>
  );
}
