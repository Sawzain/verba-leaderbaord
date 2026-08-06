import { OLIVE, OLIVE_LIGHT } from "../theme";
import { StarDisplay } from "./StarRating";

// Shared "★★★★☆ 4.2 · 12 reviews" pattern used on book cards and the
// book detail page. Falls back to a muted empty-state message when there's
// no rating data yet — callers can customize the copy (e.g. the detail
// page's "be the first" CTA vs. the card's plain "No reviews yet") and any
// extra wrapper spacing via wrapperStyle.
export default function RatingSummary({
  rating,
  count,
  starSize = 12,
  textSize = 11,
  emptyMessage = "No reviews yet",
  wrapperStyle,
}) {
  if (!rating) {
    return (
      <div
        style={{
          fontSize: textSize,
          color: OLIVE_LIGHT,
          fontStyle: "italic",
          ...wrapperStyle,
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        ...wrapperStyle,
      }}
    >
      <StarDisplay value={rating} size={starSize} />
      <span style={{ fontSize: textSize, color: OLIVE }}>
        {rating} · {count} review{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}