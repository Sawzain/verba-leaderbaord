import { Link } from "react-router-dom";
import { StarDisplay } from "./StarRating";
import { resolveCoverUrl } from "../utils/resolveCoverUrl";
import {
  SAGE_DEEP,
  SAGE_DARK,
  MUTED,
  PAPER,
  SAGE_TINT,
  FONT_SERIF,
  FONT_MONO,
} from "../theme";

// Compact sidebar preview of the club's current pick — mirrors the
// ReaderIndexPreview / VerbaWallPreview pattern (own PAPER card, serif
// title + mono eyebrow, link out to the full page). Lives in the sidebar
// on Leaderboard and Verba Wall, the two wide-layout pages that don't
// already show book info in their main column.
export default function CurrentPickPreview({ books = [], loading }) {
  const currentPick = books.find((b) => b.isCurrentPick);

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
          Current pick
        </div>
        <Link
          to="/app/reviews"
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: SAGE_DARK,
            textDecoration: "underline",
          }}
        >
          Reviews →
        </Link>
      </div>

      {loading && (
        <div style={{ fontSize: 13, color: SAGE_DARK, fontStyle: "italic" }}>
          Loading…
        </div>
      )}

      {!loading && !currentPick && (
        <div style={{ fontSize: 13, color: MUTED, fontStyle: "italic" }}>
          No current pick chosen yet.
        </div>
      )}

      {!loading && currentPick && (
        <Link
          to={`/app/reviews/${currentPick._id}`}
          style={{
            display: "flex",
            gap: 12,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              width: 48,
              height: 66,
              flexShrink: 0,
              borderRadius: 6,
              overflow: "hidden",
              background: SAGE_TINT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {currentPick.coverImage ? (
              <img
                src={resolveCoverUrl(currentPick.coverImage)}
                alt={currentPick.title}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 18, opacity: 0.4 }}>📖</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: FONT_SERIF,
                fontSize: 15,
                fontWeight: 600,
                color: SAGE_DEEP,
              }}
            >
              {currentPick.title}
            </div>
            {currentPick.author && (
              <div style={{ fontSize: 12, color: SAGE_DARK, marginTop: 2 }}>
                {currentPick.author}
              </div>
            )}
            <div style={{ marginTop: 6 }}>
              {currentPick.avgRating ? (
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <StarDisplay value={currentPick.avgRating} size={11} />
                  <span style={{ fontSize: 11, color: SAGE_DARK }}>
                    {currentPick.avgRating}
                  </span>
                </span>
              ) : (
                <span style={{ fontSize: 11, color: MUTED, fontStyle: "italic" }}>
                  No reviews yet
                </span>
              )}
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
