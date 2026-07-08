`import { useState, useEffect } from "react";
import axios from "axios";

const OLIVE = "#B7C7AC";
const OLIVE_DARK = "#3C4F3C";
const OLIVE_LIGHT = "#8a9a4a";
const CREAM = "#EEE8D5";
const CREAM_DARK = "#C8D5BF";
const WHITE = "#F3F6EF";

const LOGO_SRC =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABR3dHB0AAABoAAAABRyVFJDAAABtAAAAChnVFJDAAABtAAAAChiVFJDAAABtAAAAChjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAEcAbwBvAGcAbABlAC8AUwBrAGkAYQAvAEIANAA4AEIANABDAEEAMQAzADkAQwBFAEQARQA4AEEAQgAyAEUAMwBFAEEAOAAzAEIAQgA5ADIAMwA1ADEAMlhZWiAAAAAAAACD3wAAPb////+7WFlaIAAAAAAAAEq/AACxNwAACrlYWVogAAAAAAAAKDgAABELAADIuVhZWiAAAAAAAAD21gABAAAAANMtcGFyYQAAAAAABAAAAAJmZgAA8rAAAA1QAAATtgAACfwAAAAAAAAAAG1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMACgcHCAcGCggICAsKCgsOGBAODQ0OHRUWERgjHyUkIh8iISYrNy8mKTQpISIwQTE0OTs+Pj4lLkRJQzxINz0+O//bAEMBCgsLDg0OHBAQHDsoIig7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O//AABEIBAsEJgMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAQYEBQcDAv/EAEIQAQACAQMBBQUEBwYEBwEAAAABAgMEBREGEiExQVETImFxchQyQrEjMzQ1UoGRFTZzkqHBFiVUYiRDU2OC0eEm/8QAGQEBAQEBAQEAAAAAAAAAAAAAAAECAwQF/8QAIBEBAQADAAMBAQEBAQAAAAAAAAECAxESITEyQVETIv/aAAwDAQACEQMRAD8AwwHyGQBAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEAAABQAAAAAAAAAAAAA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AUAAAAAEABQAAAAAAAAAQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAAAAAABAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAAAAAEAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAFAAAAABAAUAAAAAEABQAAAAAQAAf/9k=";

const initialMembers = [
  { name: "Amara", points: 4 },
  { name: "Linh", points: 3 },
  { name: "Soren", points: 3 },
  { name: "Priya", points: 2 },
  { name: "Felix", points: 1 },
];

const medals = ["🥇", "🥈", "🥉"];

function getRank(index, sorted, member) {
  const pts = member.points;
  const rank = sorted.findIndex((m) => m.points === pts);
  return rank;
}

export default function VerbaLeaderboard() {
  // 1. Replace your existing 'const [members, setMembers] = useState(initialMembers);'
  // with this logic:
  const [members, setMembers] = useState([]);

  // // 2. Add this useEffect block right below the state declarations:
  // useEffect(() => {
  //   localStorage.setItem("verba-members", JSON.stringify(members));
  // }, [members]);
  // Add this inside VerbaLeaderboard component
  useEffect(() => {
    fetch("http://localhost:5000/api/members")
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  const [newName, setNewName] = useState("");
  const [newPoints, setNewPoints] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editPoints, setEditPoints] = useState(0);
  const [tab, setTab] = useState("board");

  // const sorted = [...members].sort((a, b) => b.points - a.points);
  const sorted = [...members].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return a.name.localeCompare(b.name);
  });

  // const addMember = () => {
  //   if (!newName.trim()) return;
  //   setMembers((prev) => [
  //     ...prev,
  //     { name: newName.trim(), points: Number(newPoints) },
  //   ]);
  //   setNewName("");
  //   setNewPoints(0);
  // };

  const addMember = async () => {
    if (!newName.trim()) return;

    const response = await fetch("http://localhost:5000/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), points: Number(newPoints) }),
    });

    const savedMember = await response.json();
    setMembers((prev) => [...prev, savedMember]);
    setNewName("");
    setNewPoints(0);
  };

  // const removeMember = (name) => {
  //   setMembers((prev) => prev.filter((m) => m.name !== name));
  // };

  const removeMember = async (name) => {
    try {
      // 1. Tell the backend to delete the member from MongoDB
      const response = await fetch(
        `http://localhost:5000/api/members/${name}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        // 2. If the backend confirms success, update the UI by filtering out this member
        setMembers(members.filter((m) => m.username !== name));
      } else {
        console.error("Failed to delete member on server");
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
    }
  };

  const adjustPoints = (name, delta) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.name === name ? { ...m, points: Math.max(0, m.points + delta) } : m,
      ),
    );
  };

  const startEdit = (member) => {
    setEditingIndex(member.name);
    setEditPoints(member.points);
  };

  // const saveEdit = (name) => {
  //   setMembers((prev) =>
  //     prev.map((m) =>
  //       m.name === name ? { ...m, points: Number(editPoints) } : m,
  //     ),
  //   );
  //   setEditingIndex(null);
  // };

  const saveEdit = async (name) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/members/${name}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ points: Number(editPoints) }),
        },
      );

      if (response.ok) {
        setMembers((prev) =>
          prev.map((m) =>
            m.name === name ? { ...m, points: Number(editPoints) } : m,
          ),
        );
        setEditingIndex(null);
      }
    } catch (err) {
      console.error("Failed to update points:", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: OLIVE,
        fontFamily: "'Georgia', serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 16px",
      }}
    >
      {/* Header with image logo */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img
          src={LOGO_SRC}
          alt="Verba Book Club"
          style={{
            width: 160,
            height: 160,
            objectFit: "cover",
            borderRadius: "16px",
            display: "block",
            margin: "0 auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        />
        <div
          style={{
            marginTop: 12,
            fontSize: 13,
            color: OLIVE_DARK,
            letterSpacing: "2px",
            textTransform: "uppercase",
            opacity: 0.8,
          }}
        >
          Reading Leaderboard
        </div>
      </div>

      {/* Tab switcher */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          background: OLIVE_DARK,
          padding: "4px",
          borderRadius: 12,
        }}
      >
        {["board", "manage"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 24px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontFamily: "'Georgia', serif",
              background: tab === t ? CREAM : "transparent",
              color: tab === t ? OLIVE_DARK : CREAM_DARK,
              fontWeight: tab === t ? "bold" : "normal",
              transition: "all 0.2s",
            }}
          >
            {t === "board" ? "Leaderboard" : "Manage"}
          </button>
        ))}
      </div>

      {/* Main card */}
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
          <div>
            <div
              style={{
                background: OLIVE_LIGHT,
                padding: "14px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `1px solid ${CREAM_DARK}`,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: CREAM,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                📚 Book of the Month
              </span>
              <span style={{ fontSize: 13, color: CREAM, fontStyle: "italic" }}>
                1 pt per book read
              </span>
            </div>

            {sorted.length === 0 && (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "#aaa",
                  fontStyle: "italic",
                }}
              >
                No members yet. Add some in Manage!
              </div>
            )}
            {sorted.map((member, i) => {
              const isTop3 = i < 3;
              const isTied = i > 0 && sorted[i - 1].points === member.points;
              const displayRank = isTied
                ? sorted.findIndex((m) => m.points === member.points) + 1
                : i + 1;

              return (
                <div
                  key={member.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px 24px",
                    borderBottom: `1px solid ${CREAM}`,
                    background: i === 0 ? `${CREAM}55` : "transparent",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      fontSize: isTop3 ? 22 : 14,
                      textAlign: "center",
                      color: OLIVE,
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
                    {isTop3
                      ? medals[displayRank - 1] || displayRank
                      : displayRank}
                  </div>

                  <div style={{ flex: 1, paddingLeft: 12 }}>
                    <div
                      style={{
                        fontSize: 17,
                        color: "#2d2d2d",
                        fontFamily: "'Georgia', serif",
                        fontWeight: i === 0 ? "bold" : "normal",
                      }}
                    >
                      {member.name}
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div
                      style={{
                        background: OLIVE_DARK,
                        color: CREAM,
                        borderRadius: 20,
                        padding: "4px 14px",
                        fontSize: 14,
                        fontWeight: "bold",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {member.points} pt{member.points !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              );
            })}

            <div
              style={{
                padding: "12px 24px",
                background: OLIVE_LIGHT,
                textAlign: "center",
                fontSize: 12,
                color: CREAM,
                letterSpacing: "1px",
                textTransform: "uppercase",
                // opacity: 0.7,
              }}
            >
              {members.length} reader{members.length !== 1 ? "s" : ""} · Verba
              Book Club
            </div>
          </div>
        )}

        {tab === "manage" && (
          <div style={{ padding: "24px" }}>
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
                  style={{
                    background: OLIVE,
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
              <div
                key={member.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: `1px solid ${CREAM}`,
                  gap: 10,
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

                {editingIndex === member.name ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
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
                      onClick={() => saveEdit(member.name)}
                      style={{
                        background: OLIVE,
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
                      onClick={() => setEditingIndex(null)}
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
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <button
                      onClick={() => adjustPoints(member.name, -1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: `1.5px solid ${CREAM_DARK}`,
                        background: "white",
                        cursor: "pointer",
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
                      onClick={() => startEdit(member)}
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
                      {member.points} pt
                    </div>
                    <button
                      onClick={() => adjustPoints(member.name, 1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: `1.5px solid ${CREAM_DARK}`,
                        background: "white",
                        cursor: "pointer",
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
                      onClick={() => removeMember(member.name)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ccc",
                        cursor: "pointer",
                        fontSize: 16,
                        marginLeft: 4,
                      }}
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
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
`