import { OLIVE, OLIVE_DARK, OLIVE_LIGHT, CREAM, CREAM_DARK } from "../theme";

// Lives inside AppShell's 620px cream card, so no full-page background here —
// just content styled to match Leaderboard/Reviews. Georgia serif throughout,
// per the app's existing type choice. The leaf glyph nods to "Verba" (willow)
// without introducing a new visual language on top of the existing one.
// Quotes and poems share this one page, switched via the Quotes/Poems/All
// toggle rather than living on separate tabs. Sort order (newest first)
// comes from the backend — this component just renders what it's given.

// Pasted quotes often already come wrapped in their own quotation marks
// (straight or curly) from Discord. Since this component adds its own
// wrapping quotes when rendering, strip any pre-existing leading/trailing
// quote characters first so we don't end up with doubled marks like ""text"".
const stripOuterQuotes = (text = "") =>
  text
    .trim()
    .replace(/^["“”'‘’]+/, "")
    .replace(/["“”'‘’]+$/, "");

// Some pasted quotes have the attribution (Author, Book) baked into
// quote_text itself as a second line, rather than living only in the
// separate book_title/display_name fields — and the quote line itself often
// already carries its own leading/trailing quote marks. This splits off the
// first line (the real quote) from any trailing lines (the attribution) and
// strips quote marks from each independently, so wrapping the quote in our
// own quotes doesn't double up.
const splitQuoteAndAttribution = (text = "") => {
  const [firstLine, ...rest] = text.trim().split("\n");
  return {
    quote: stripOuterQuotes(firstLine),
    attribution: stripOuterQuotes(rest.join(" ")),
  };
};

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

// Card background matches the app's translucent-cream language (same idea
// as AppShell's frosted panel) instead of a stark white block.
const CARD_BG = "rgba(255,255,255,0.4)";
const CARD_BORDER = "rgba(107,122,58,0.28)"; // OLIVE at low alpha

export default function QuoteWallView({
  quotes,
  loading,
  error,
  bookFilter,
  setBookFilter,
  sourceFilter,
  setSourceFilter,
  page,
  totalPages,
  goToPage,
}) {
  const books = [...new Set(quotes.map((q) => q.book_title).filter(Boolean))];
  // Only pin a featured quote on page 1, so it doesn't appear to duplicate
  // across pages as you paginate.
  const featured = page === 1 ? quotes.find((q) => q.is_featured) : null;
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
          Verba Wall
        </h2>
        <p
          style={{ margin: 0, fontStyle: "italic", color: OLIVE, fontSize: 14 }}
        >
          Words worth pressing between pages
        </p>
      </div>

      {/* Segmented toggle, restyled to match TabSwitcher's olive/cream pill nav */}
      <div
        style={{
          display: "flex",
          gap: 4,
          justifyContent: "center",
          marginBottom: 16,
          background: OLIVE_DARK,
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
              background: sourceFilter === value ? CREAM : "transparent",
              color: sourceFilter === value ? OLIVE_DARK : CREAM_DARK,
              fontWeight: sourceFilter === value ? "bold" : "normal",
              transition: "all 0.15s",
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
        <p style={emptyStyle}>Couldn't load — try refreshing.</p>
      ) : quotes.length === 0 ? (
        <p style={emptyStyle}>
          {sourceFilter === "poetry-corner"
            ? "No poems pressed yet — drop one in #poetry-corner and it'll show up here."
            : sourceFilter === "quotes-highlights"
              ? "No quotes pressed yet — drop a line in #quotes-highlights and it'll show up here."
              : "Nothing pressed yet — post in #quotes-highlights or #poetry-corner and it'll show up here."}
        </p>
      ) : (
        <>
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
                  Featured
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
                  "{splitQuoteAndAttribution(featured.quote_text).quote}"
                  {splitQuoteAndAttribution(featured.quote_text)
                    .attribution && (
                    <span
                      style={{
                        display: "block",
                        fontStyle: "normal",
                        marginTop: 4,
                      }}
                    >
                      {
                        splitQuoteAndAttribution(featured.quote_text)
                          .attribution
                      }
                    </span>
                  )}
                </p>
                <QuoteMeta quote={featured} />
              </div>
            )}

            {rest.map((q) => (
              <div
                key={q.id}
                style={{
                  border: `1px solid ${CARD_BORDER}`,
                  background: CARD_BG,
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
                  "{splitQuoteAndAttribution(q.quote_text).quote}"
                  {splitQuoteAndAttribution(q.quote_text).attribution && (
                    <span
                      style={{
                        display: "block",
                        fontStyle: "normal",
                        marginTop: 4,
                      }}
                    >
                      {splitQuoteAndAttribution(q.quote_text).attribution}
                    </span>
                  )}
                </p>
                <QuoteMeta quote={q} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
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
                    style={{
                      padding: "0 4px",
                      fontSize: 12.5,
                      color: OLIVE_LIGHT,
                    }}
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
                ),
              )}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                style={pageButtonStyle(page >= totalPages)}
              >
                Next →
              </button>
            </div>
          )}
        </>
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
        style={{
          color: OLIVE_DARK,
          textDecoration: "none",
          fontWeight: "bold",
        }}
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

// Small round number buttons; the current page reads as a filled/disabled
// chip so it's visually distinct without looking like a dead end.
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

const emptyStyle = {
  textAlign: "center",
  fontStyle: "italic",
  color: OLIVE,
  padding: "40px 16px",
};
