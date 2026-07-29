import { useState, useRef } from "react";
import { CREAM, CREAM_DARK, WHITE } from "../theme";

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

export default function AddBookForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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
      await onAdd({ title: title.trim(), author: author.trim(), file });
      reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div
          style={{
            width: 72,
            height: 96,
            flexShrink: 0,
            borderRadius: 8,
            overflow: "hidden",
            background: "#e4ddc7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {preview ? (
            <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 20, opacity: 0.4 }}>📖</span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 180 }}>
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
        </div>
      </div>

      {error && <div style={{ marginTop: 8, fontSize: 13, color: "#a33" }}>{error}</div>}

      <button
        onClick={submit}
        disabled={busy}
        style={{
          marginTop: 10,
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
        {busy ? "Adding…" : "Add book"}
      </button>
    </div>
  );
}
