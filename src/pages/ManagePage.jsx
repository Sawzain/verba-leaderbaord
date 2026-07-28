import { useOutletContext } from "react-router-dom";
import ManageView from "../components/ManageView";

export default function ManagePage() {
  const { auth, membersState } = useOutletContext();
  const {
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
    editingIndex,
    setEditingIndex,
    editPoints,
    setEditPoints,
    addMember,
    removeMember,
    adjustPoints,
    startEdit,
    saveEdit,
  } = membersState;

  return (
    <ManageView
      auth={auth}
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
  );
}
