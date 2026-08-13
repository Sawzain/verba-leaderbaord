import { Link } from "react-router-dom";
import { SAGE_DEEP, SAGE_DARK, PAPER, SAGE_TINT, FONT_SERIF, FONT_MONO } from "../theme";

// Compact sidebar preview of the Leaderboard — top 3 readers by points, plus
// a member count and a link to the full page. Lives next to Reviews under
// the Option D layout; LeaderboardView itself is unaffected and stays a
// full-width page of its own. Expects `sorted` already ranked (same shape
// LeaderboardView receives), just slices the top 3.
export default function ReaderIndexPreview({ sorted = [], memberCount = 0 }) {
  const top3 = sorted.slice(0, 3);

  return (
    <div
      style={{
        background: PAPER,
        borderRadius: 16,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 14,
        }}
      >
        <div style={{ fontFamily: FONT_SERIF, fontSize: 19, color: SAGE_DEEP }}>
          Reader Index
        </div>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: SAGE_DARK,
            letterSpacing: "0.3px",
          }}
        >
          {memberCount} MEMBER{memberCount !== 1 ? "S" : ""}
        </span>
      </div>

      {top3.length === 0 ? (
        <div style={{ fontSize: 13, color: SAGE_DARK, fontStyle: "italic" }}>
          No readers yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {top3.map((member, i) => (
            <Link
              key={member._id}
              to={`/app/members/${member._id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 0",
                borderTop: i > 0 ? "1px solid rgba(45,51,39,0.08)" : "none",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: SAGE_DARK,
                  width: 16,
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 14,
                  color: SAGE_DEEP,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {member.name}
              </span>
              <span
                style={{
                  background: SAGE_TINT,
                  color: SAGE_DEEP,
                  borderRadius: 7,
                  padding: "3px 9px",
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.3px",
                  flexShrink: 0,
                }}
              >
                {member.points} BOOK{member.points !== 1 ? "S" : ""}
              </span>
            </Link>
          ))}
        </div>
      )}

      <Link
        to="/app/leaderboard"
        style={{
          display: "block",
          marginTop: 14,
          fontFamily: FONT_MONO,
          fontSize: 11,
          color: SAGE_DARK,
          textDecoration: "underline",
        }}
      >
        View full leaderboard →
      </Link>
    </div>
  );
}
