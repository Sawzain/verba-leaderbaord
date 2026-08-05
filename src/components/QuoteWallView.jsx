import { OLIVE, OLIVE_DARK, OLIVE_LIGHT, CREAM, CREAM_DARK, WHITE } from "../theme";

// Lives inside AppShell's 620px cream card, so no full-page background here —
// just content styled to match Leaderboard/Reviews. Georgia serif throughout,
// per the app's existing type choice. The leaf glyph nods to "Verba" (willow)
// without introducing a new visual language on top of the existing one.
// Quotes and poems share this one page, switched via the Quotes/Poems/All
// toggle rather than living on separate tabs.

const LeafMark = ({ size = 16, color = OLIVE_LIGHT }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
    <path
      d="M20 4C10 10 6 20 12 32c2-6 6-11 12-14-4 6-6 12-6 18 10-4 16-14 14-26-4 2-8 3-12 3 2-3 4-6 0-9z"
      fill={color}
    />
  </svg>
);

const SOURCE_TABS = [
  { value: "", label: "All" },
  { value: "quotes-highlights", label: "Quotes" },
  { value: "poetry-corner", label: "Poems" },
];

export default function QuoteWallView({
  quotes,
  loading,
  error,
  bookFilter,
  setBookFilter,
  sourceFilter,
  setSourceFilter,
}) {
  const books = [...new Set(quotes.map((q) => q.book_title).filter(Boolean))];
  const featured = quotes.find((q) => q.is_featured);
  const rest = quotes.filter((q) => q.id !== featured?.id);

  return (
    <div style={{ padding: "28px 24px 32px", fontFamily: "'Georgia', serif" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2
          style={{
            margin: "0 0 4px",
            color: OLIVE_DARK,
            fontSize: 26,
            letterSpacing: "0.5px",
          }}
        >
          Quote Wall
        </h2>
        <p style={{ margin: 0, fontStyle: "italic", color: OLIVE, fontSize: 14 }}>
          Words worth pressing between pages
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginBottom: 16,
          background: CREAM_DARK,
          padding: 4,
          borderRadius: 10,
          maxWidth: 280,
          margin: "0 auto 16px",
        }}
      >
        {SOURCE_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSourceFilter(value)}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              fontSize: 12.5,
              fontFamily: "'Georgia', serif",
              background: sourceFilter === value ? WHITE : "transparent",
              color: OLIVE_DARK,
              fontWeight: sourceFilter === value ? "bold" : "normal",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {books.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <button
            onClick={() => setBookFilter("")}
            style={chipStyle(bookFilter === "")}
          >
            All books
          </button>
          {books.map((b) => (
            <button
              key={b}
              onClick={() => setBookFilter(b)}
              style={chipStyle(bookFilter === b)}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p style={emptyStyle}>Gathering the leaves…</p>
      ) : error ? (
        <p style={emptyStyle}>Couldn't load quotes — try refreshing.</p>
      ) : quotes.length === 0 ? (
        <p style={emptyStyle}>
          {sourceFilter === "poetry-corner"
            ? "No poems pressed yet — drop one in #poetry-corner and it'll show up here."
            : sourceFilter === "quotes-highlights"
            ? "No quotes pressed yet — drop a line in #quotes-highlights and it'll show up here."
            : "Nothing pressed yet — post in #quotes-highlights or #poetry-corner and it'll show up here."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {featured && (
            <div
              style={{
                border: `1px solid ${OLIVE_LIGHT}`,
                background: CREAM_DARK,
                borderRadius: 10,
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: OLIVE_DARK,
                  fontWeight: "bold",
                  marginBottom: 8,
                }}
              >
                Quote of the month
              </div>
              <LeafMark size={18} />
              <p
                style={{
                  fontStyle: "italic",
                  color: OLIVE_DARK,
                  fontSize: 17,
                  lineHeight: 1.5,
                  margin: "8px 0 10px",
                  whiteSpace: "pre-line",
                }}
              >
                "{featured.quote_text}"
              </p>
              <QuoteMeta quote={featured} />
            </div>
          )}

          {rest.map((q) => (
            <div
              key={q.id}
              style={{
                border: `1px solid ${CREAM_DARK}`,
                background: WHITE,
                borderRadius: 10,
                padding: "16px 18px",
              }}
            >
              <LeafMark size={15} />
              <p
                style={{
                  fontStyle: "italic",
                  color: OLIVE_DARK,
                  fontSize: 15.5,
                  lineHeight: 1.5,
                  margin: "6px 0 10px",
                  whiteSpace: "pre-line",
                }}
              >
                "{q.quote_text}"
              </p>
              <QuoteMeta quote={q} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuoteMeta({ quote }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 12.5,
        color: OLIVE,
      }}
    >
      <span>
        {quote.display_name}
        {quote.book_title ? ` · ${quote.book_title}` : ""}
      </span>
      <a
        href={quote.discord_message_url}
        target="_blank"
        rel="noreferrer"
        style={{ color: OLIVE_DARK, textDecoration: "none", fontWeight: "bold" }}
      >
        View →
      </a>
    </div>
  );
}

function chipStyle(active) {
  return {
    padding: "6px 14px",
    borderRadius: 999,
    border: `1px solid ${OLIVE_LIGHT}`,
    background: active ? OLIVE_DARK : "transparent",
    color: active ? CREAM : OLIVE_DARK,
    fontSize: 12.5,
    fontFamily: "'Georgia', serif",
    cursor: "pointer",
  };
}

const emptyStyle = {
  textAlign: "center",
  fontStyle: "italic",
  color: OLIVE,
  padding: "40px 16px",
};
