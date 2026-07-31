import { useState, useRef } from "react";
import { OLIVE_DARK, CREAM, CREAM_DARK, WHITE } from "../theme";
import { resolveCoverUrl } from "../utils/resolveCoverUrl";

const MAX_COVER_BYTES = 5 * 1024 * 1024; // matches the server's multer limit

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
  const [hoveringCover, setHoveringCover] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
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

  const fieldStyle = (name) => ({
    padding: "11px 14px",
    borderRadius: 10,
    border: `1.5px solid ${focusedField === name ? OLIVE_DARK : CREAM_DARK}`,
    fontSize: 15,
    fontFamily: "'Georgia', serif",
    outline: "none",
    background: WHITE,
    color: "#2d2d2d",
    boxSizing: "border-box",
    width: "100%",
    transition: "border-color 0.15s ease",
  });

  return (
    <div
      style={{
        background: "#f6f3e8",
        border: `1px solid ${CREAM_DARK}`,
        borderRadius: 14,
        padding: "22px 20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: OLIVE_DARK,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {mode === "add" ? "Add a book" : "Edit book details"}
      </div>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <div
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={() => setHoveringCover(true)}
          onMouseLeave={() => setHoveringCover(false)}
          style={{
            position: "relative",
            width: 92,
            height: 122,
            flexShrink: 0,
            borderRadius: 10,
            overflow: "hidden",
            background: "#e4ddc7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: `1.5px dashed ${hoveringCover ? OLIVE_DARK : "transparent"}`,
            boxShadow: coverPreviewSrc ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
            transition: "border-color 0.15s ease",
          }}
        >
          {coverPreviewSrc ? (
            <img
              src={coverPreviewSrc}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 26, opacity: 0.4 }}>📖</span>
          )}

          {(hoveringCover || !coverPreviewSrc) && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: coverPreviewSrc
                  ? "rgba(0,0,0,0.45)"
                  : "transparent",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: coverPreviewSrc ? WHITE : "#6B7A3A",
                  fontFamily: "'Georgia', serif",
                  letterSpacing: "0.3px",
                }}
              >
                {coverPreviewSrc ? "Change cover" : "Add cover"}
              </span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={pickFile}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              cursor: "pointer",
              width: "100%",
              height: "100%",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
            minWidth: 220,
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setFocusedField("title")}
            onBlur={() => setFocusedField(null)}
            placeholder="Book title"
            style={fieldStyle("title")}
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            onFocus={() => setFocusedField("author")}
            onBlur={() => setFocusedField(null)}
            placeholder="Author (optional)"
            style={fieldStyle("author")}
          />
          {mode === "edit" && (
            <div style={{ fontSize: 12, color: "#9a9578" }}>
              Click the cover to replace it, or leave it as is.
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, fontSize: 13, color: "#a33" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <button
          onClick={submit}
          disabled={busy}
          style={{
            background: "#6B7A3A",
            color: CREAM,
            border: "none",
            borderRadius: 10,
            padding: "10px 22px",
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
              padding: "10px 22px",
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
