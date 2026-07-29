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
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: `1px solid ${CREAM}`,
        gap: 10,
        opacity: isSaving ? 0.6 : 1,
        transition: "opacity 0.15s",
      }}
    >
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
            −
          </button>
          <div
            onClick={() => onStartEdit(member)}
            title="Click to edit"
            className="verba-clickable"
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
            {member.points} pt
          </div>
          <button
            onClick={() => onAdjustPoints(member._id, 1)}
            disabled={isSaving}
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

          <button
            onClick={onRemove}
            disabled={isSaving}
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
  );
}
