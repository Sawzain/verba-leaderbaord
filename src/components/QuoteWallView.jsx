import { useEffect, useState } from "react";
import {
  SAGE_DARK,
  SAGE_DEEP,
  SAGE,
  PAPER,
  SAGE_TINT,
  FONT_SERIF,
  FONT_SANS,
} from "../theme";
import Pagination from "./Pagination";

// Long poems are common on the Wall — anything over this line count
// collapses by default with a "Read more" toggle, so scrolling through
// the page doesn't mean scrolling through one person's entire poem first.
const COLLAPSE_LINE_THRESHOLD = 6;

// AppShell no longer wraps pages in a frosted cream panel (removed in the
// full-site revamp), so this view owns its own PAPER card against the
// SAGE page background — same pattern as Leaderboard. The leaf glyph nods
// to "Verba" (willow) without introducing a new visual language on top of
// the existing one.
// Quotes and poems share this one page, switched via the Quotes/Poems/All
// toggle rather than living on separate tabs. Sort order (newest first)
// comes from the backend — this component just renders what it's given.

// quote_text is rendered exactly as pasted from Discord — no stripping,
// no added quote marks, no other reformatting. The one exception: Discord's
// own inline markdown (**bold**, *italic*/_italic_, __underline__,
// ~~strikethrough~~, `code`) is parsed into real formatting instead of
// showing the literal asterisks/underscores, since that's how the text
// appeared in Discord itself. Line breaks are preserved by splitting on
// "\n" and inserting <br /> between lines (rather than CSS
// whiteSpace: "pre-line", which only works on plain strings, not the
// mixed text/element arrays this produces).
const INLINE_MARKDOWN =
  /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;

const parseInlineMarkdown = (line, lineKey) =>
  line
    .split(INLINE_MARKDOWN)
    .filter((part) => part !== "")
    .map((part, i) => {
      const key = `${lineKey}-${i}`;
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return <strong key={key}>{part.slice(2, -2)}</strong>;
      }
      if (/^__[^_]+__$/.test(part)) {
        return <u key={key}>{part.slice(2, -2)}</u>;
      }
      if (/^~~[^~]+~~$/.test(part)) {
        return <s key={key}>{part.slice(2, -2)}</s>;
      }
      if (/^\*[^*]+\*$/.test(part) || /^_[^_]+_$/.test(part)) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }
      if (/^`[^`]+`$/.test(part)) {
        return <code key={key}>{part.slice(1, -1)}</code>;
      }
      return part;
    });

const renderDiscordText = (text = "") => {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <span key={i}>
      {parseInlineMarkdown(line, i)}
      {i < lines.length - 1 && <br />}
    </span>
  ));
};

// Always keeps first, last, and a small window around the current page so it
// stays readable even with dozens of pages.

const LeafMark = ({ size = 16, color = SAGE }) => (
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

// Sage tint against the PAPER wrapper card, matching the treatment used
// on Current Pick, review cards, and the profile bio box.
const CARD_BG = `${SAGE}66`;
const CARD_BORDER = SAGE;

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
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [stickyTop, setStickyTop] = useState(0);
  useEffect(() => {
    const updateStickyTop = () => {
      const bar = document.querySelector(".verba-topbar");
      setStickyTop(bar ? bar.getBoundingClientRect().height : 0);
    };
    updateStickyTop();
    window.addEventListener("resize", updateStickyTop);
    return () => window.removeEventListener("resize", updateStickyTop);
  }, []);
  const toggleExpanded = (id) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const books = [...new Set(quotes.map((q) => q.book_title).filter(Boolean))];
  // Only pin a featured quote on page 1, so it doesn't appear to duplicate
  // across pages as you paginate.
  const featured = page === 1 ? quotes.find((q) => q.is_featured) : null;
  const rest = quotes.filter((q) => q.id !== featured?.id);

  return (
    <div
      style={{
        background: PAPER,
        border: "1px solid rgba(45,51,39,0.08)",
        borderRadius: 14,
        padding: "28px 24px 32px",
        fontFamily: FONT_SERIF,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2
          style={{
            margin: "0 0 4px",
            color: SAGE_DEEP,
            fontSize: 26,
            letterSpacing: "0.5px",
          }}
        >
          Verba Wall
        </h2>
        <p
          style={{
            margin: 0,
            fontStyle: "italic",
            color: SAGE_DARK,
            fontSize: 14,
          }}
        >
          Words worth pressing between pages
        </p>
      </div>

      <div
        style={{
          position: "sticky",
          top: stickyTop,
          zIndex: 90,
          textAlign: "center",
          padding: "12px 28px",
          margin: "-12px -24px 16px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            gap: 6,
            flexWrap: "wrap",
            background: SAGE_DEEP,
            padding: 3,
            borderRadius: 10,
            maxWidth: "100%",
          }}
        >
          {SOURCE_TABS.map(({ value, label }) => {
            const active = sourceFilter === value;
            return (
              <button
                key={value}
                onClick={() => setSourceFilter(value)}
                style={{
                  fontFamily: FONT_SANS,
                  fontStyle: "normal",
                  fontWeight: active ? 700 : 500,
                  color: active ? SAGE_DEEP : PAPER,
                  fontSize: 13,
                  lineHeight: 1.5,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  background: active ? PAPER : "transparent",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
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
                  border: `1px solid ${SAGE}`,
                  background: MUTED,
                  borderRadius: 10,
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: SAGE_DEEP,
                    fontWeight: "bold",
                    marginBottom: 8,
                  }}
                >
                  Featured
                </div>
                <LeafMark size={18} />
                <QuoteBody
                  text={featured.quote_text}
                  expanded={expandedIds.has(featured.id)}
                  onToggle={() => toggleExpanded(featured.id)}
                  fontSize={17}
                />
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
                <QuoteBody
                  text={q.quote_text}
                  expanded={expandedIds.has(q.id)}
                  onToggle={() => toggleExpanded(q.id)}
                  fontSize={15.5}
                />
                <QuoteMeta quote={q} />
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} goToPage={goToPage} />
        </>
      )}
    </div>
  );
}

function QuoteBody({ text, expanded, onToggle, fontSize }) {
  const lines = (text || "").split("\n");
  const isLong = lines.length > COLLAPSE_LINE_THRESHOLD;
  const visibleText =
    isLong && !expanded
      ? lines.slice(0, COLLAPSE_LINE_THRESHOLD).join("\n")
      : text;

  return (
    <>
      <p
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: "normal",
          color: SAGE_DEEP,
          fontSize,
          lineHeight: 1.6,
          margin: "8px 0 4px",
          maxWidth: "62ch",
        }}
      >
        {renderDiscordText(visibleText)}
        {isLong && !expanded && "…"}
      </p>
      {isLong && (
        <button
          onClick={onToggle}
          style={{
            background: "none",
            border: "none",
            color: SAGE_DARK,
            fontSize: 12.5,
            fontFamily: FONT_SERIF,
            fontWeight: "bold",
            cursor: "pointer",
            padding: 0,
            margin: "0 0 10px",
            textDecoration: "underline",
          }}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </>
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
        color: SAGE_DARK,
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
          color: SAGE_DEEP,
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
    border: `1px solid ${SAGE}`,
    background: active ? SAGE_DEEP : "transparent",
    color: active ? PAPER : SAGE_DEEP,
    fontSize: 12.5,
    fontFamily: FONT_SERIF,
    cursor: "pointer",
  };
}

// chip so it's visually distinct without looking like a dead end.

const emptyStyle = {
  textAlign: "center",
  fontStyle: "italic",
  color: SAGE_DARK,
  padding: "40px 16px",
};
