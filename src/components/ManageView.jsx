import { useState } from "react";
import { OLIVE, OLIVE_DARK, CREAM, CREAM_DARK, WHITE } from "../theme";
import MemberRow from "./MemberRow";

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

function AdminKeyGate({ status, onUnlock }) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);

  const submit = () => {
    if (!value.trim()) return;
    onUnlock(value.trim());
  };

  return (
    <div style={{ padding: "32px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
      <div
        style={{
          fontSize: 15,
          color: "#2d2d2d",
          marginBottom: 4,
          fontWeight: "bold",
        }}
      >
        Manage view is locked
      </div>
      <div style={{ fontSize: 13, color: OLIVE_DARK, marginBottom: 20 }}>
        Enter the admin key to add, edit, or remove members.
      </div>

      <div style={{ display: "flex", gap: 8, maxWidth: 340, margin: "0 auto" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Admin key"
          autoFocus
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          title={show ? "Hide key" : "Show key"}
          style={{
            border: `1.5px solid ${CREAM_DARK}`,
            background: WHITE,
            borderRadius: 10,
            width: 42,
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          {show ? "🙈" : "👁"}
        </button>
      </div>

      <button
        onClick={submit}
        disabled={status === "checking"}
        style={{
          marginTop: 12,
          background: "#6B7A3A",
          color: CREAM,
          border: "none",
          borderRadius: 10,
          padding: "10px 28px",
          fontSize: 15,
          cursor: status === "checking" ? "default" : "pointer",
          opacity: status === "checking" ? 0.7 : 1,
          fontFamily: "'Georgia', serif",
        }}
      >
        {status === "checking" ? "Checking…" : "Unlock"}
      </button>

      {status === "invalid" && (
        <div style={{ marginTop: 14, fontSize: 13, color: "#a33" }}>
          That key wasn't accepted. Double-check it and try again.
        </div>
      )}
    </div>
  );
}

export default function ManageView({
  adminKey,
  adminStatus,
  isUnlocked,
  unlockAdmin,
  lockAdmin,
  members,
  filteredMembers,
  search,
  setSearch,
  loading,
  error,
  setError,
  savingId,
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
  if (!isUnlocked) {
    return <AdminKeyGate status={adminStatus} onUnlock={unlockAdmin} />;
  }

  const handleRemove = (id, name) => {
    if (window.confirm(`Remove ${name} from the leaderboard? This can't be undone.`)) {
      removeMember(id);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          background: "#eef3e2",
          border: "1px solid #d3e0bd",
          borderRadius: 10,
          padding: "8px 12px",
        }}
      >
        <span style={{ fontSize: 13, color: "#3f4d1e", fontWeight: "bold" }}>
          🔓 Unlocked — you can edit the leaderboard
        </span>
        <button
          onClick={lockAdmin}
          style={{
            background: "transparent",
            border: "none",
            color: OLIVE_DARK,
            fontSize: 12,
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Lock
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 20,
            background: "#fbeaea",
            border: "1px solid #e6b8b8",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            color: "#7a2a2a",
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: "none",
              border: "none",
              color: "#7a2a2a",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ✕
          </button>
        </div>
      )}

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
            style={{ ...inputStyle, flex: 2, minWidth: 140 }}
          />
          <input
            type="number"
            min={0}
            value={newPoints}
            onChange={(e) => setNewPoints(e.target.value)}
            placeholder="Pts"
            style={{
              ...inputStyle,
              flex: 1,
              minWidth: 60,
              maxWidth: 80,
              padding: "10px 10px",
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: OLIVE,
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Members
        </div>
        {members.length > 0 && (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            style={{
              ...inputStyle,
              padding: "6px 10px",
              fontSize: 13,
              width: 140,
            }}
          />
        )}
      </div>

      {loading && (
        <div style={{ color: "#aaa", fontStyle: "italic", padding: "20px 0", textAlign: "center" }}>
          Loading members…
        </div>
      )}

      {!loading && members.length === 0 && (
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

      {!loading && members.length > 0 && filteredMembers.length === 0 && (
        <div
          style={{
            color: "#aaa",
            fontStyle: "italic",
            padding: "20px 0",
            textAlign: "center",
          }}
        >
          No members match "{search}".
        </div>
      )}

      {filteredMembers.map((member) => (
        <MemberRow
          key={member._id}
          member={member}
          isEditing={editingIndex === member._id}
          isSaving={savingId === member._id}
          editPoints={editPoints}
          setEditPoints={setEditPoints}
          onStartEdit={startEdit}
          onCancelEdit={() => setEditingIndex(null)}
          onSaveEdit={saveEdit}
          onAdjustPoints={adjustPoints}
          onRemove={() => handleRemove(member._id, member.name)}
        />
      ))}
    </div>
  );
}
