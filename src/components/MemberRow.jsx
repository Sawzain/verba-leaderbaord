import { useState } from "react";
import {
  SAGE,
  SAGE_DARK,
  SAGE_DEEP,
  PAPER,
  MUTED,
  INK,
  SAGE_TINT,
  FONT_SERIF,
  PLACEHOLDER,
} from "../theme";

export default function MemberRow({
  member,
  isEditing,
  isSaving,
  editPoints,
  setEditPoints,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onAdjustPoints,
  onRemove,
  onMarkRead,
  onLinkAccount,
  books = [],
  currentPickId,
  unlinkedUsers = [],
}) {
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showLinkPicker, setShowLinkPicker] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "12px 0",
        borderBottom: `1px solid ${SAGE_TINT}`,
        gap: 6,
        opacity: isSaving ? 0.6 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight: 600,
            color: INK,
            fontFamily: FONT_SERIF,
          }}
        >
          {member.name}
        </div>

        {isEditing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="number"
              min={0}
              value={editPoints}
              onChange={(e) => setEditPoints(e.target.value)}
              style={{
                width: 60,
                padding: "6px 8px",
                borderRadius: 8,
                border: `1px solid ${SAGE}`,
                background: `${SAGE}66`,
                fontSize: 14,
                textAlign: "center",
                fontFamily: FONT_SERIF,
                color: INK,
              }}
            />
            <button
              className="verba-btn"
              onClick={() => onSaveEdit(member._id)}
              style={{
                background: SAGE_DARK,
                color: PAPER,
                border: "none",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: FONT_SERIF,
              }}
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              aria-label="Cancel editing points"
              style={{
                background: "transparent",
                color: SAGE_DEEP,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: FONT_SERIF,
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => onAdjustPoints(member._id, -1)}
              disabled={isSaving}
              aria-label={`Decrease ${member.name}'s points`}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: `1.5px solid ${MUTED}`,
                background: PAPER,
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                cursor: isSaving ? "default" : "pointer",
                fontSize: 19,
                color: SAGE_DEEP,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_SERIF,
              }}
            >
              −
            </button>

            <div
              onClick={() => onStartEdit(member)}
              title="Click to edit"
              style={{
                width: 68,
                textAlign: "center",
                background: `${SAGE}66`,
                borderRadius: 8,
                padding: "6px 8px",
                fontSize: 16,
                fontWeight: "bold",
                color: SAGE_DEEP,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: FONT_SERIF,
              }}
            >
              {member.points} book{member.points !== 1 ? "s" : ""}
            </div>

            {showBookPicker ? (
              <select
                autoFocus
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value && onMarkRead) {
                    onMarkRead(member._id, e.target.value);
                  }
                  setShowBookPicker(false);
                }}
                onBlur={() => setShowBookPicker(false)}
                style={{
                  fontSize: 12,
                  borderRadius: 8,
                  padding: "4px 6px",
                  border: `1.5px solid ${SAGE_DARK}`,
                  fontFamily: FONT_SERIF,
                  maxWidth: 130,
                  color: INK,
                  background: PAPER,
                }}
              >
                <option value="" disabled style={{ color: PLACEHOLDER }}>
                  Which book?
                </option>
                {books.map((b) => {
                  const isRead = member.completedBooks?.includes(b._id);
                  return (
                    <option
                      key={b._id}
                      value={b._id}
                      disabled={isRead}
                      style={{ color: isRead ? MUTED : INK }}
                    >
                      {b.title}{" "}
                      {isRead
                        ? "✓ (already read)"
                        : b.isCurrentPick
                          ? "(current)"
                          : ""}
                    </option>
                  );
                })}
              </select>
            ) : (
              <button
                onClick={() => setShowBookPicker(true)}
                disabled={isSaving}
                aria-label={`Mark ${member.name} as finished a book`}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: `1.5px solid ${MUTED}`,
                  background: PAPER,
                  cursor: isSaving ? "default" : "pointer",
                  fontSize: 19,
                  color: SAGE_DEEP,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT_SERIF,
                }}
              >
                +
              </button>
            )}

            <button
              onClick={onRemove}
              disabled={isSaving}
              aria-label={`Remove ${member.name}`}
              onMouseEnter={(e) => (e.currentTarget.style.color = SAGE_DEEP)}
              onMouseLeave={(e) => (e.currentTarget.style.color = INK)}
              style={{
                background: "transparent",
                border: "none",
                color: INK,
                cursor: isSaving ? "default" : "pointer",
                fontSize: 16,
                marginLeft: 4,
                fontFamily: FONT_SERIF,
              }}
            >
              🗑
            </button>
          </div>
        )}
      </div>

      {onLinkAccount && (
        <div style={{ paddingLeft: 2, minHeight: 18 }}>
          {!member.userId &&
            (showLinkPicker ? (
              <select
                autoFocus
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) onLinkAccount(member._id, e.target.value);
                  setShowLinkPicker(false);
                }}
                onBlur={() => setShowLinkPicker(false)}
                style={{
                  fontSize: 11,
                  borderRadius: 6,
                  padding: "3px 6px",
                  border: `1px solid ${SAGE_DARK}`,
                  fontFamily: FONT_SERIF,
                  color: INK,
                  background: PAPER,
                }}
              >
                <option value="" disabled style={{ color: PLACEHOLDER }}>
                  Link to Discord account…
                </option>
                {unlinkedUsers.map((u) => (
                  <option key={u._id} value={u._id} style={{ color: INK }}>
                    {u.name}
                  </option>
                ))}
              </select>
            ) : (
              <button
                onClick={() => setShowLinkPicker(true)}
                style={{
                  fontSize: 11,
                  color: SAGE_DEEP,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                  fontFamily: FONT_SERIF,
                }}
              >
                Link Discord account
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
