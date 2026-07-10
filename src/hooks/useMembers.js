import { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000/api/members";

export default function useMembers(adminKey) {
  const [members, setMembers] = useState([]);
  const [newName, setNewName] = useState("");
  const [newPoints, setNewPoints] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editPoints, setEditPoints] = useState(0);

  useEffect(() => {
    fetch(API_BASE)
      .then((res) => res.json())
      .then((data) =>
        setMembers(
          data.map((m) => ({ name: m.username, points: m.score, _id: m._id })),
        ),
      )
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  const sorted = [...members]
    .filter((m) => m && m.name)
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  const addMember = async () => {
    if (!newName.trim()) return;
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": adminKey },
      body: JSON.stringify({
        username: newName.trim(),
        score: Number(newPoints),
      }),
    });

    if (response.status === 401) {
      alert("Invalid or missing admin key — check the key in the Manage tab.");
      return;
    }

    const savedMember = await response.json();
    setMembers((prev) => [
      ...prev,
      { name: savedMember.username, points: savedMember.score, _id: savedMember._id },
    ]);
    setNewName("");
    setNewPoints(0);
  };

  const removeMember = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { "x-api-key": adminKey },
      });

      if (response.status === 401) {
        alert("Invalid or missing admin key — check the key in the Manage tab.");
        return;
      }

      if (response.ok) {
        setMembers((prev) => prev.filter((m) => m._id !== id));
      } else {
        console.error("Failed to delete member on server");
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
    }
  };

  const adjustPoints = (id, delta) => {
    setMembers((prev) =>
      prev.map((m) =>
        m._id === id ? { ...m, points: Math.max(0, m.points + delta) } : m,
      ),
    );
  };

  const startEdit = (member) => {
    setEditingIndex(member._id);
    setEditPoints(member.points);
  };

  const saveEdit = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-api-key": adminKey },
        body: JSON.stringify({ score: Number(editPoints) }),
      });

      if (response.status === 401) {
        alert("Invalid or missing admin key — check the key in the Manage tab.");
        return;
      }

      if (response.ok) {
        setMembers((prev) =>
          prev.map((m) =>
            m._id === id ? { ...m, points: Number(editPoints) } : m,
          ),
        );
        setEditingIndex(null);
      }
    } catch (err) {
      console.error("Failed to update points:", err);
    }
  };

  return {
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
  };
}
