import { useState } from "react";
import Header from "./components/Header";
import TabSwitcher from "./components/TabSwitcher";
import LeaderboardView from "./components/LeaderboardView";
import ManageView from "./components/ManageView";
import BooksView from "./components/BooksView";
import useMembers from "./hooks/useMembers";
import useAdminKey from "./hooks/useAdminKey";
import useBooks from "./hooks/useBooks";
import useAuth from "./hooks/useAuth";
import { CREAM, CREAM_DARK } from "./theme";

export default function VerbaLeaderboard() {
  const [tab, setTab] = useState("board");
  const { adminKey, status: adminStatus, isUnlocked, unlock, lock } = useAdminKey();
  const booksState = useBooks();
  const auth = useAuth();
  const {
    members,
    sorted,
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
    editingIndex,
    setEditingIndex,
    editPoints,
    setEditPoints,
    addMember,
    removeMember,
    adjustPoints,
    startEdit,
    saveEdit,
  } = useMembers(adminKey);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#B7C7AC",
        fontFamily: "'Georgia', serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 16px",
      }}
    >
      <Header />
      <TabSwitcher tab={tab} setTab={setTab} />

      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: CREAM,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
        }}
      >
        {tab === "board" && (
          <LeaderboardView sorted={sorted} memberCount={members.length} loading={loading} />
        )}
        {tab === "books" && (
          <BooksView
            books={booksState.books}
            loading={booksState.loading}
            error={booksState.error}
            isAdminUnlocked={isUnlocked}
            adminKey={adminKey}
            addBook={booksState.addBook}
            removeBook={booksState.removeBook}
            fetchBook={booksState.fetchBook}
            addReview={booksState.addReview}
            removeReview={booksState.removeReview}
            removeMyReview={booksState.removeMyReview}
            editReview={booksState.editReview}
            auth={auth}
          />
        )}
        {tab === "manage" && (
          <ManageView
            adminKey={adminKey}
            adminStatus={adminStatus}
            isUnlocked={isUnlocked}
            unlockAdmin={unlock}
            lockAdmin={lock}
            members={members}
            filteredMembers={filteredMembers}
            search={search}
            setSearch={setSearch}
            loading={loading}
            error={error}
            setError={setError}
            savingId={savingId}
            newName={newName}
            setNewName={setNewName}
            newPoints={newPoints}
            setNewPoints={setNewPoints}
            addMember={addMember}
            editingIndex={editingIndex}
            setEditingIndex={setEditingIndex}
            editPoints={editPoints}
            setEditPoints={setEditPoints}
            startEdit={startEdit}
            saveEdit={saveEdit}
            adjustPoints={adjustPoints}
            removeMember={removeMember}
          />
        )}
      </div>

      <div
        style={{
          marginTop: 20,
          color: CREAM_DARK,
          fontSize: 12,
          opacity: 0.5,
          letterSpacing: "1px",
        }}
      >
        verba — words that stay
      </div>
    </div>
  );
}
