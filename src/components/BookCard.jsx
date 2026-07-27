import { OLIVE_DARK, CREAM, CREAM_DARK } from "../theme";
import { StarDisplay } from "./StarRating";

export default function BookCard({ book, onOpen, canRemove, onRemove }) {
  return (
    <div
      onClick={onOpen}
      style={{
        cursor: "pointer",
        background: CREAM,
        border: `1px solid ${CREAM_DARK}`,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "3 / 4",
          background: "#e4ddc7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 32, opacity: 0.4 }}>📖</span>
        )}
      </div>

      <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 14, fontWeight: "bold", color: "#2d2d2d", lineHeight: 1.3 }}>
          {book.title}
        </div>
        {book.author && (
          <div style={{ fontSize: 12, color: OLIVE_DARK, marginTop: 2 }}>{book.author}</div>
        )}

        <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
          {book.avgRating ? (
            <>
              <StarDisplay value={book.avgRating} size={12} />
              <span style={{ fontSize: 11, color: "#888" }}>
                {book.avgRating} · {book.reviewCount} review{book.reviewCount !== 1 ? "s" : ""}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 11, color: "#aaa", fontStyle: "italic" }}>No reviews yet</span>
          )}
        </div>

        {canRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              marginTop: 8,
              alignSelf: "flex-start",
              background: "transparent",
              border: "none",
              color: "#a33",
              fontSize: 11,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
