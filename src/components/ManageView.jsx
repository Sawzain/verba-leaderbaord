import { useState } from "react";
import { OLIVE, OLIVE_DARK, CREAM, CREAM_DARK, WHITE } from "../theme";
import MemberRow from "./MemberRow";
import AdminPasswordReset from "./AdminPasswordReset";
import AuthPanel from "./AuthPanel";
import AccountBar from "./AccountBar";

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

// Admin access is an isAdmin flag on a normal account, not a separate key —
// so this gate reuses the same login/signup form members use elsewhere.
function AdminGate({ auth }) {
  if (auth.isLoggedIn) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
        <div style={{ fontSize: 15, color: "#2d2d2d", marginBottom: 4, fontWeight: "bold" }}>
          Admin access required
        </div>
        <div style={{ fontSize: 13, color: OLIVE_DARK, maxWidth: 320, margin: "0 auto" }}>
          You're logged in as {auth.user?.name || "a member"}, but this account doesn't have
          admin access yet. Ask an existing admin to grant it.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
        <div style={{ fontSize: 15, color: "#2d2d2d", marginBottom: 4, fontWeight: "bold" }}>
          Manage view is locked
        </div>
        <div style={{ fontSize: 13, color: OLIVE_DARK }}>
          Log in with an admin account to add, edit, or remove members.
        </div>
      </div>
      <AuthPanel
        authError={auth.authError}
        setAuthError={auth.setAuthError}
        authBusy={auth.authBusy}
        onRegister={auth.register}
        onLogin={auth.login}
        discordLoginUrl={auth.discordLoginUrl}
      />
    </div>
  );
}

export default function ManageView({
  auth,
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
  const isAdmin = auth.isLoggedIn && Boolean(auth.user?.isAdmin);

  if (!isAdmin) {
    return <AdminGate auth={auth} />;
  }

  const handleRemove = (id, name) => {
    if (window.confirm(`Remove ${name} from the leaderboard? This can't be undone.`)) {
      removeMember(id);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <AccountBar auth={auth} />

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
            aria-label="Dismiss error"
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

      <AdminPasswordReset token={auth.token} />

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
