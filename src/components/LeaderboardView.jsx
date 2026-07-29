import { useMemo, useState } from "react";
import {
  OLIVE,
  OLIVE_DARK,
  OLIVE_LIGHT,
  CREAM,
  CREAM_DARK,
  medals,
} from "../theme";
import useSlowLoadHint from "../hooks/useSlowLoadHint";

export default function LeaderboardView({ sorted, memberCount, loading }) {
  const [search, setSearch] = useState("");
  const showSlowHint = useSlowLoadHint(loading);

  const visible = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter((m) => m.name.toLowerCase().includes(q));
  }, [sorted, search]);

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
        <div style={{ padding: "12px 24px 0" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search readers…"
            style={{
              width: "100%",
              padding: "8px 14px",
              borderRadius: 10,
              border: `1.5px solid ${CREAM_DARK}`,
              fontSize: 14,
              fontFamily: "'Georgia', serif",
              outline: "none",
              background: "#fff",
              color: "#2d2d2d",
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

      {visible.map((member) => {
        // Rank always reflects the member's true position on the full
        // (unfiltered) leaderboard, even while a search is narrowing the view.
        const displayRank =
          sorted.findIndex((m) => m.points === member.points) + 1;
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
              background: isFirstPlace ? `${CREAM}55` : "transparent",
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
                  color: "#2d2d2d",
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
                  background: OLIVE_DARK,
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
