import { SAGE_DEEP, MUTED, PAPER, FONT_SERIF } from "../theme";

// Compact sidebar feed of recent activity. Merges two separate sources:
//  - `activity`: book finishes / reviews, logged to Mongo's ActivityLog
//    (see server/routes/activity.js)
//  - `quotes`: quotes & poems, which live in Supabase and are inserted
//    directly by the Discord bot — they never pass through our API, so
//    there's no ActivityLog row to join against. Instead we take the
//    same newest-first quotes list already fetched for the Verba Wall
//    preview (useQuotes with no filter) and merge it in here by date,
//    rather than standing up a backend sync job just for this feed.
function normalizeQuote(q) {
  const isPoem = q.source_channel === "poetry-corner";
  return {
    key: `quote-${q.id}`,
    memberName: q.display_name,
    createdAt: q.created_at,
    verb: "posted in",
    target: isPoem ? "Poetry Corner" : "Quotes & Highlights",
    italicTarget: false,
  };
}

function normalizeActivity(a, i) {
  return {
    key: `activity-${i}-${a.createdAt}`,
    memberName: a.memberName,
    createdAt: a.createdAt,
    verb: a.type === "review" ? "reviewed" : "finished",
    target: a.bookTitle || "a book",
    italicTarget: true,
  };
}

export default function RecentActivityPreview({ activity = [], quotes = [] }) {
  const merged = [...activity.map(normalizeActivity), ...quotes.map(normalizeQuote)]
    .filter((entry) => entry.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

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
          fontFamily: FONT_SERIF,
          fontSize: 19,
          color: SAGE_DEEP,
          marginBottom: 14,
        }}
      >
        Recent activity
      </div>

      {merged.length === 0 ? (
        <div style={{ fontSize: 13, color: MUTED, fontStyle: "italic" }}>
          Nothing yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {merged.map((entry, i) => (
            <div
              key={entry.key}
              style={{
                padding: "9px 0",
                borderTop: i > 0 ? "1px solid rgba(45,51,39,0.08)" : "none",
                fontSize: 13,
                color: SAGE_DEEP,
                lineHeight: 1.5,
              }}
            >
              <strong>{entry.memberName}</strong> {entry.verb}{" "}
              {entry.italicTarget ? <em>{entry.target}</em> : entry.target}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
