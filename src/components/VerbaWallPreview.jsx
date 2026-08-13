import { Link } from "react-router-dom";
import { SAGE_DEEP, PAPER, MUTED, CLAY, FONT_SERIF, FONT_MONO } from "../theme";

// Compact sidebar preview of the Verba Wall — a single quote (the featured
// one if there is one, otherwise the most recent) plus a link to the full
// page. Lives next to Reviews under the Option D layout; the full
// QuoteWallView is unaffected and stays a full-width page of its own.
export default function VerbaWallPreview({ quote }) {
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
          Verba Wall
        </div>
        <Link
          to="/app/quotes"
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: CLAY,
            textDecoration: "none",
            fontWeight: 600,
            letterSpacing: "0.3px",
          }}
        >
          Explore →
        </Link>
      </div>

      {!quote ? (
        <div
          style={{
            fontSize: 13,
            color: MUTED,
            fontStyle: "italic",
          }}
        >
          Nothing pressed yet.
        </div>
      ) : (
        <div
          style={{
            borderLeft: `2px solid ${SAGE_DEEP}`,
            paddingLeft: 14,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: FONT_SERIF,
              fontSize: 15.5,
              fontStyle: "italic",
              color: SAGE_DEEP,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 6,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            "{quote.quote_text}"
          </p>
          <div
            style={{
              marginTop: 10,
              fontFamily: FONT_MONO,
              fontSize: 10.5,
              color: MUTED,
              letterSpacing: "0.3px",
            }}
          >
            — {quote.display_name?.toUpperCase()}
            {quote.book_title && (
              <>
                ,{" "}
                <span style={{ fontFamily: FONT_SERIF, fontStyle: "italic" }}>
                  {quote.book_title}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
