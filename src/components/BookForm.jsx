import { useState, useRef } from "react";
import { OLIVE_DARK, CREAM, CREAM_DARK, WHITE } from "../theme";
import { resolveCoverUrl } from "../utils/resolveCoverUrl";

const inputStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: `1.5px solid ${CREAM_DARK}`,
  fontSize: 15,
  fontFamily: "'Georgia', serif",
  outline: "none",
  background: WHITE,
  color: "#2d2d2d",
  boxSizing: "border-box",
};

const MAX_COVER_BYTES = 5 * 1024 * 1024; // matches the server's multer limit

// Shared by BooksView (adding a new book) and BookDetail (editing an
// existing one, admin only) so both flows look and behave identically
// instead of two separate ad-hoc forms.
export default function BookForm({
  mode = "add", // "add" | "edit"
  initialValues,
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [author, setAuthor] = useState(initialValues?.author || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const existingCoverUrl =
    mode === "edit" && initialValues?.coverImage
      ? resolveCoverUrl(initialValues.coverImage)
      : null;

  const pickFile = (e) => {
    const f = e.target.files?.[0] || null;
    if (preview) URL.revokeObjectURL(preview);

    if (f && f.size > MAX_COVER_BYTES) {
      setError("That image is over 5MB — please pick a smaller file.");
      e.target.value = "";
      setFile(null);
      setPreview(null);
      return;
    }

    setError(null);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setTitle("");
    setAuthor("");
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ title: title.trim(), author: author.trim(), file });
      if (mode === "add") reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const coverPreviewSrc = preview || existingCoverUrl;

  return (
    <div
      style={{
        background: "#f6f3e8",
        border: `1px solid ${CREAM_DARK}`,
        borderRadius: 12,
        padding: "18px 16px",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: OLIVE_DARK,
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        {mode === "add" ? "Add a book" : "Edit book details"}
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div
          style={{
            width: 80,
            height: 106,
            flexShrink: 0,
            borderRadius: 8,
            overflow: "hidden",
            background: "#e4ddc7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {coverPreviewSrc ? (
            <img
              src={coverPreviewSrc}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 22, opacity: 0.4 }}>📖</span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            flex: 1,
            minWidth: 200,
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Book title"
            style={inputStyle}
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author (optional)"
            style={inputStyle}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={pickFile}
            style={{ fontSize: 13, fontFamily: "'Georgia', serif" }}
          />
          {mode === "edit" && (
            <div style={{ fontSize: 12, color: "#9a9578" }}>
              Leave the file picker empty to keep the current cover.
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 10, fontSize: 13, color: "#a33" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button
          onClick={submit}
          disabled={busy}
          style={{
            background: "#6B7A3A",
            color: CREAM,
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            fontSize: 14,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.7 : 1,
            fontFamily: "'Georgia', serif",
          }}
        >
          {busy
            ? mode === "add"
              ? "Adding…"
              : "Saving…"
            : mode === "add"
              ? "Add book"
              : "Save changes"}
        </button>
        {mode === "edit" && onCancel && (
          <button
            onClick={onCancel}
            disabled={busy}
            style={{
              background: "none",
              border: `1.5px solid ${CREAM_DARK}`,
              borderRadius: 10,
              padding: "10px 20px",
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Georgia', serif",
              color: "#2d2d2d",
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
