import { useState, useEffect } from "react";
import axios from "axios";

const OLIVE = "#6B7A3A";
const OLIVE_DARK = "#4f5a28";
const OLIVE_LIGHT = "#8a9a4a";
const CREAM = "#EEE8D5";
const CREAM_DARK = "#d9d1b8";
const WHITE = "#FAF7F0";
const LOGO_SRC = "/logo.jpg";
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
      .then((data) =>
        setMembers(
          data.map((m) => ({ name: m.username, points: m.score, _id: m._id })),
        ),
      )
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  const [newName, setNewName] = useState("");
  const [newPoints, setNewPoints] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editPoints, setEditPoints] = useState(0);
  const [tab, setTab] = useState("board");

  const sorted = [...members]
    .filter((m) => m && m.name)
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

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
      body: JSON.stringify({
        username: newName.trim(),
        score: Number(newPoints),
      }),
    });
    const savedMember = await response.json();
    setMembers((prev) => [
      ...prev,
      {
        name: savedMember.username,
        points: savedMember.score,
        _id: savedMember._id,
      },
    ]);
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

        background: "#B7C7AC",

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
              const isTied = i > 0 && sorted[i - 1].points === member.points;
              const displayRank = isTied
                ? sorted.findIndex((m) => m.points === member.points) + 1
                : i + 1;
              const isTop3 = displayRank <= 3;

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
                      onClick={() => removeMember(member.username)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#222")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#333")
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#333",
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
