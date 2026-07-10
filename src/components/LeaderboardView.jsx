import { OLIVE, OLIVE_DARK, OLIVE_LIGHT, CREAM, CREAM_DARK, medals } from "../theme";

export default function LeaderboardView({ sorted, memberCount }) {
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

      {sorted.length === 0 && (
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
      {sorted.map((member, i) => {
        const isTied = i > 0 && sorted[i - 1].points === member.points;
        const displayRank = isTied
          ? sorted.findIndex((m) => m.points === member.points) + 1
          : i + 1;
        const isTop3 = displayRank <= 3;

        return (
          <div
            key={member.name}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 24px",
              borderBottom: `1px solid ${CREAM}`,
              background: i === 0 ? `${CREAM}55` : "transparent",
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
                  fontWeight: i === 0 ? "bold" : "normal",
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
