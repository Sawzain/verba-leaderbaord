import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SAGE_DEEP, PAPER, MUTED, CLAY, FONT_SERIF, FONT_MONO } from "../theme";

const ROTATE_MS = 8000;
// Once there are at least this many admin-favorited quotes in the pool,
// the rotator prefers cycling through those instead of the raw recent list.
const MIN_FAVORITES_TO_PREFER = 3;

// Compact sidebar preview of the Verba Wall — cycles through a small pool
// of quotes automatically, with dots to jump back to one that already
// passed. Prefers admin-favorited quotes once there are enough of them.
export default function VerbaWallPreview({ quotes = [] }) {
  const pool = useMemo(() => {
    const favorites = quotes.filter((q) => q.is_admin_favorite);
    return favorites.length >= MIN_FAVORITES_TO_PREFER ? favorites : quotes;
  }, [quotes]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Keep index in range if the pool shrinks/changes underneath us.
  useEffect(() => {
    if (index >= pool.length) setIndex(0);
  }, [pool, index]);

  useEffect(() => {
    if (paused || pool.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % pool.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, pool.length]);

  const quote = pool[index];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
        <div style={{ fontSize: 13, color: MUTED, fontStyle: "italic" }}>
          Nothing pressed yet.
        </div>
      ) : (
        <>
          <div
            key={quote.id}
            className="verba-fade-in"
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

          {pool.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                justifyContent: "center",
                marginTop: 14,
              }}
            >
              {pool.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Show quote ${i + 1}`}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    background: i === index ? CLAY : `${SAGE_DEEP}33`,
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
