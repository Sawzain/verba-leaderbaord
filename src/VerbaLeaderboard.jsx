import { useState } from "react";
import Header from "./components/Header";
import TabSwitcher from "./components/TabSwitcher";
import LeaderboardView from "./components/LeaderboardView";
import ManageView from "./components/ManageView";
import useMembers from "./hooks/useMembers";
import useAdminKey from "./hooks/useAdminKey";
import { CREAM, CREAM_DARK } from "./theme";

export default function VerbaLeaderboard() {
  const [tab, setTab] = useState("board");
  const { adminKey, saveAdminKey } = useAdminKey();
  const {
    members,
    sorted,
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
          <LeaderboardView sorted={sorted} memberCount={members.length} />
        )}
        {tab === "manage" && (
          <ManageView
            adminKey={adminKey}
            saveAdminKey={saveAdminKey}
            members={members}
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
