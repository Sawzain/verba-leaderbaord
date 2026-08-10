import { useState } from "react";
import { OLIVE, OLIVE_DARK, CREAM, CREAM_DARK } from "../theme";

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
        borderBottom: `1px solid ${CREAM}`,
        gap: 6,
        opacity: isSaving ? 0.6 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            flex: 1,
            fontSize: 16,
            color: "#2d2d2d",
            fontFamily: "'Georgia', serif",
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
                border: `1.5px solid ${OLIVE}`,
                fontSize: 14,
                textAlign: "center",
                fontFamily: "'Georgia', serif",
              }}
            />
            <button
              className="verba-btn"
              onClick={() => onSaveEdit(member._id)}
              style={{
                background: "#6B7A3A",
                color: CREAM,
                border: "none",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              aria-label="Cancel editing points"
              style={{
                background: "transparent",
                color: "#0a3101",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
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
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: `1.5px solid ${CREAM_DARK}`,
                background: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                cursor: isSaving ? "default" : "pointer",
                fontSize: 16,
                color: OLIVE_DARK,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              −
            </button>

            <div
              onClick={() => onStartEdit(member)}
              title="Click to edit"
              style={{
                minWidth: 44,
                textAlign: "center",
                background: CREAM,
                borderRadius: 8,
                padding: "4px 8px",
                fontSize: 14,
                fontWeight: "bold",
                color: OLIVE_DARK,
                cursor: "pointer",
              }}
            >
              {member.points} book{member.points !== 1 ? "s" : ""}
              {member.points} pt
            </div>

            {showBookPicker && onMarkRead ? (
              <select
                autoFocus
                defaultValue={currentPickId || ""}
                onChange={(e) => {
                  if (e.target.value) onMarkRead(member._id, e.target.value);
                  setShowBookPicker(false);
                }}
                onBlur={() => setShowBookPicker(false)}
                style={{
                  fontSize: 12,
                  borderRadius: 8,
                  padding: "4px 6px",
                  border: `1.5px solid ${OLIVE}`,
                  fontFamily: "'Georgia', serif",
                  maxWidth: 130,
                }}
              >
                <option value="" disabled>
                  Which book?
                </option>
                {books.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.title}
                    {b.isCurrentPick ? " (current)" : ""}
                  </option>
                ))}
              </select>
            ) : (
              <button
                onClick={() =>
                  onMarkRead
                    ? setShowBookPicker(true)
                    : onAdjustPoints(member._id, 1)
                }
                disabled={isSaving}
                aria-label={`Mark ${member.name} as finished a book`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: `1.5px solid ${CREAM_DARK}`,
                  background: "white",
                  cursor: isSaving ? "default" : "pointer",
                  fontSize: 16,
                  color: OLIVE_DARK,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                +
              </button>
            )}

            <button
              onClick={onRemove}
              disabled={isSaving}
              aria-label={`Remove ${member.name}`}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#222")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
              style={{
                background: "transparent",
                border: "none",
                color: "#333",
                cursor: isSaving ? "default" : "pointer",
                fontSize: 16,
                marginLeft: 4,
              }}
            >
              🗑
            </button>
          </div>
        )}
      </div>

      {onLinkAccount && !member.userId && (
        <div style={{ paddingLeft: 2 }}>
          {showLinkPicker ? (
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
                border: `1px solid ${OLIVE}`,
                fontFamily: "'Georgia', serif",
              }}
            >
              <option value="" disabled>
                Link to Discord account…
              </option>
              {unlinkedUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setShowLinkPicker(true)}
              style={{
                fontSize: 11,
                color: OLIVE_DARK,
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Link Discord account
            </button>
          )}
        </div>
      )}
    </div>
  );
}
