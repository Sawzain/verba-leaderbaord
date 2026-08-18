import { useState } from "react";
import {
  SAGE,
  SAGE_DARK,
  SAGE_DEEP,
  PAPER,
  MUTED,
  INK,
  FONT_SERIF,
  DANGER,
  DANGER_LIGHT,
  DANGER_DARK,
} from "../theme";
import MemberRow from "./MemberRow";
import AdminPasswordReset from "./AdminPasswordReset";
import AuthPanel from "./AuthPanel";

// AppShell no longer wraps pages in a frosted cream panel (removed in the
// full-site revamp) — this view owns its own PAPER card against the SAGE
// page background, same pattern as Leaderboard/Verba Wall. Applied to both
// the locked-out AdminGate states and the main admin content below.
const cardStyle = {
  background: PAPER,
  border: "1px solid rgba(45,51,39,0.08)",
  borderRadius: 14,
};

const inputStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: `1px solid ${SAGE}`,
  fontSize: 15,
  fontFamily: FONT_SERIF,
  outline: "none",
  background: PAPER,
  color: INK,
  boxSizing: "border-box",
};

// Admin access is an isAdmin flag on a normal account, not a separate key —
// so this gate reuses the same login/signup form members use elsewhere.
function AdminGate({ auth }) {
  if (auth.isLoggedIn) {
    return (
      <div style={{ ...cardStyle, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
        <div
          style={{
            fontSize: 15,
            color: INK,
            marginBottom: 4,
            fontWeight: "bold",
          }}
        >
          Admin access required
        </div>
        <div
          style={{
            fontSize: 13,
            color: SAGE_DEEP,
            maxWidth: 320,
            margin: "0 auto",
          }}
        >
          You're logged in as {auth.user?.name || "a member"}, but this account
          doesn't have admin access yet. Ask an existing admin to grant it.
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...cardStyle, padding: "32px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
        <div
          style={{
            fontSize: 15,
            color: INK,
            marginBottom: 4,
            fontWeight: "bold",
          }}
        >
          Manage view is locked
        </div>
        <div style={{ fontSize: 13, color: SAGE_DEEP }}>
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
  markRead, // NEW — from useMembers
  linkAccount, // NEW — from useMembers
  books, // NEW — from useBooks(), for the mark-read dropdown
  currentPickId, // NEW — from useBooks(), dropdown default
  unlinkedUsers, // NEW — unlinked Discord accounts, for the link dropdown
}) {
  const isAdmin = auth.isLoggedIn && Boolean(auth.user?.isAdmin);

  if (!isAdmin) {
    return <AdminGate auth={auth} />;
  }

  const handleRemove = (id, name) => {
    if (
      window.confirm(
        `Remove ${name} from the leaderboard? This can't be undone.`,
      )
    ) {
      removeMember(id);
    }
  };

  return (
    <div style={{ ...cardStyle, padding: "24px" }}>
      {error && (
        <div
          style={{
            marginBottom: 20,
            background: DANGER_LIGHT,
            border: `1px solid ${DANGER_DARK}`,
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            color: DANGER,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span>{error}</span>
          <button
            className="verba-btn"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            style={{
              background: "none",
              border: "none",
              color: DANGER,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <AdminPasswordReset token={auth.token} />

      <div
        style={{
          marginTop: 24,
          marginBottom: 24,
          paddingTop: 24,
          borderTop: "1px solid rgba(45,51,39,0.08)",
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: SAGE_DEEP,
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Add new member
        </div>
        <div
          style={{
            background: `${SAGE}66`,
            border: `1px solid ${SAGE}`,
            borderRadius: 12,
            padding: "16px",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMember()}
            placeholder="Name"
            style={{ ...inputStyle, flex: "1 1 150px", minWidth: 0 }}
          />

          {/* Custom themed dropdown */}
          {(() => {
            const [open, setOpen] = useState(false);
            const [selectedId, setSelectedId] = useState(currentPickId || "");
            const selectedBook = books?.find((b) => b._id === selectedId);

            return (
              <div style={{ position: "relative", flex: "1 1 160px", minWidth: 0 }}>
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  style={{
                    ...inputStyle,
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedBook ? selectedBook.title : "Select completed book…"}
                  </span>
                  <span style={{ fontSize: 10, marginLeft: 6, color: SAGE_DEEP }}>▼</span>
                </button>

                {open && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: 4,
                      background: PAPER,
                      border: `1px solid ${SAGE}`,
                      borderRadius: 10,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      zIndex: 10,
                      maxHeight: 180,
                      overflowY: "auto",
                    }}
                  >
                    <div
                      onClick={() => {
                        setSelectedId("");
                        setOpen(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: 15,
                        fontFamily: FONT_SERIF,
                        color: SAGE_DEEP,
                        borderBottom: `1px solid ${SAGE_TINT}`,
                      }}
                    >
                      Select completed book…
                    </div>
                    {books?.map((b) => (
                      <div
                        key={b._id}
                        onClick={() => {
                          setSelectedId(b._id);
                          setOpen(false);
                        }}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: 15,
                          fontFamily: FONT_SERIF,
                          color: INK,
                          background: selectedId === b._id ? SAGE_TINT : "transparent",
                        }}
                      >
                        {b.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          <input
            type="number"
            min={0}
            value={newPoints}
            onChange={(e) => setNewPoints(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMember()}
            placeholder="Starting count"
            title="Starting books count — leave blank to start at 0"
            style={{ ...inputStyle, flex: "1 1 100px", minWidth: 0 }}
          />

          <button
            className="verba-btn"
            onClick={addMember}
            style={{
              background: SAGE_DARK,
              color: PAPER,
              border: "none",
              borderRadius: 10,
              padding: "10px 18px",
              fontSize: 15,
              cursor: "pointer",
              fontFamily: FONT_SERIF,
              flexShrink: 0,
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
          marginTop: 24,
          paddingTop: 24,
          borderTop: "1px solid rgba(45,51,39,0.08)",
        }}
      >
        <div
          style={{
            fontSize: 15,
            color: SAGE_DARK,
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontWeight: "bold",
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
        <div
          style={{
            color: MUTED,
            fontStyle: "italic",
            padding: "20px 0",
            textAlign: "center",
          }}
        >
          Loading members…
        </div>
      )}

      {!loading && members.length === 0 && (
        <div
          style={{
            color: MUTED,
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
            color: MUTED,
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
          onMarkRead={markRead}
          onLinkAccount={linkAccount}
          books={books}
          currentPickId={currentPickId}
          unlinkedUsers={unlinkedUsers}
        />
      ))}
    </div>
  );
}
