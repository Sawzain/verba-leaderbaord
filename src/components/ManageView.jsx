import { OLIVE, OLIVE_DARK, CREAM, CREAM_DARK, WHITE } from "../theme";
import MemberRow from "./MemberRow";

export default function ManageView({
  adminKey,
  saveAdminKey,
  members,
  newName,
  setNewName,
  newPoints,
  setNewPoints,
  addMember,
  editingIndex,
  setEditingIndex,
  editPoints,
  setEditPoints,
  startEdit,
  saveEdit,
  adjustPoints,
  removeMember,
}) {
  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 13,
            color: OLIVE_DARK,
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Admin key
        </div>
        <input
          type="password"
          value={adminKey}
          onChange={(e) => saveAdminKey(e.target.value)}
          placeholder="Paste admin key to enable editing"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: `1.5px solid ${CREAM_DARK}`,
            fontSize: 14,
            fontFamily: "'Georgia', serif",
            outline: "none",
            background: WHITE,
            color: "#2d2d2d",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 13,
            color: OLIVE_DARK,
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Add new member
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMember()}
            placeholder="Name"
            style={{
              flex: 2,
              minWidth: 140,
              padding: "10px 14px",
              borderRadius: 10,
              border: `1.5px solid ${CREAM_DARK}`,
              fontSize: 15,
              fontFamily: "'Georgia', serif",
              outline: "none",
              background: WHITE,
              color: "#2d2d2d",
            }}
          />
          <input
            type="number"
            min={0}
            value={newPoints}
            onChange={(e) => setNewPoints(e.target.value)}
            placeholder="Pts"
            style={{
              flex: 1,
              minWidth: 60,
              maxWidth: 80,
              padding: "10px 10px",
              borderRadius: 10,
              border: `1.5px solid ${CREAM_DARK}`,
              fontSize: 15,
              fontFamily: "'Georgia', serif",
              outline: "none",
              background: WHITE,
              color: "#2d2d2d",
              textAlign: "center",
            }}
          />
          <button
            onClick={addMember}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            style={{
              background: "#6B7A3A",
              color: CREAM,
              border: "none",
              borderRadius: 10,
              padding: "10px 18px",
              fontSize: 15,
              cursor: "pointer",
              fontFamily: "'Georgia', serif",
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          color: OLIVE,
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Members
      </div>

      {members.length === 0 && (
        <div
          style={{
            color: "#aaa",
            fontStyle: "italic",
            padding: "20px 0",
            textAlign: "center",
          }}
        >
          No members yet.
        </div>
      )}

      {members.map((member) => (
        <MemberRow
          key={member.name}
          member={member}
          isEditing={editingIndex === member.name}
          editPoints={editPoints}
          setEditPoints={setEditPoints}
          onStartEdit={startEdit}
          onCancelEdit={() => setEditingIndex(null)}
          onSaveEdit={saveEdit}
          onAdjustPoints={adjustPoints}
          onRemove={removeMember}
        />
      ))}
    </div>
  );
}
