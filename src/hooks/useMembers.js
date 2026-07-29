import { useState, useEffect, useMemo, useCallback } from "react";

// In dev, Vite proxies /api to the Express server (see vite.config.js),
// so the frontend never needs to know the backend's host or port.
// In prod, set VITE_API_BASE if the API is served from a different origin.
export const API_ROOT = import.meta.env.VITE_API_BASE || "/api";
const API_BASE = `${API_ROOT}/members`;

// `enabled` lets callers (AppShell) defer fetching members until a tab that
// actually needs them is active, instead of fetching on every /app/* mount
// regardless of which tab you're on. Once loaded, `hasLoaded` keeps the
// data cached so switching tabs back and forth doesn't refetch.
export default function useMembers(token, enabled = true) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [search, setSearch] = useState("");

  const [newName, setNewName] = useState("");
  const [newPoints, setNewPoints] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editPoints, setEditPoints] = useState(0);
  const [savingId, setSavingId] = useState(null);

  const loadMembers = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetch(API_BASE)
      .then((res) => {
        if (!res.ok) throw new Error("Server responded with an error");
        return res.json();
      })
      .then((data) => {
        setMembers(
          data.map((m) => ({ name: m.username, points: m.score, _id: m._id })),
        );
        setHasLoaded(true);
      })
      .catch(() =>
        setError("Couldn't reach the server. Check your connection and try again."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (enabled && !hasLoaded) loadMembers();
  }, [enabled, hasLoaded, loadMembers]);

  const sorted = useMemo(
    () =>
      [...members]
        .filter((m) => m && m.name)
        .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name)),
    [members],
  );

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.trim().toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(q));
  }, [members, search]);

  const withAuthError = async (fn) => {
    try {
      return await fn();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      return null;
    }
  };

  const addMember = () =>
    withAuthError(async () => {
      if (!newName.trim()) return;
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          username: newName.trim(),
          score: Number(newPoints) || 0,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Your admin session was rejected. Please log in again.");
      }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Couldn't add that member.");
      }

      const saved = await response.json();
      setMembers((prev) => [
        ...prev,
        { name: saved.username, points: saved.score, _id: saved._id },
      ]);
      setNewName("");
      setNewPoints(0);
      setError(null);
    });

  const removeMember = (id) =>
    withAuthError(async () => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Your admin session was rejected. Please log in again.");
      }
      if (!response.ok) {
        throw new Error("Couldn't remove that member.");
      }

      setMembers((prev) => prev.filter((m) => m._id !== id));
      setError(null);
    });

  // Optimistic: update the UI immediately, then persist, then roll back
  // on failure so the +/- buttons never silently lose the change.
  const adjustPoints = (id, delta) =>
    withAuthError(async () => {
      let previousPoints;
      setMembers((prev) =>
        prev.map((m) => {
          if (m._id !== id) return m;
          previousPoints = m.points;
          return { ...m, points: Math.max(0, m.points + delta) };
        }),
      );

      const nextPoints = Math.max(0, (previousPoints ?? 0) + delta);
      setSavingId(id);
      try {
        const response = await fetch(`${API_BASE}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ score: nextPoints }),
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error("Your admin session was rejected. Please log in again.");
        }
        if (!response.ok) {
          throw new Error("Couldn't save that change.");
        }
        setError(null);
      } catch (err) {
        // roll back the optimistic update
        setMembers((prev) =>
          prev.map((m) => (m._id === id ? { ...m, points: previousPoints } : m)),
        );
        throw err;
      } finally {
        setSavingId(null);
      }
    });

  const startEdit = (member) => {
    setEditingIndex(member._id);
    setEditPoints(member.points);
  };

  const saveEdit = (id) =>
    withAuthError(async () => {
      setSavingId(id);
      try {
        const response = await fetch(`${API_BASE}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ score: Number(editPoints) || 0 }),
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error("Your admin session was rejected. Please log in again.");
        }
        if (!response.ok) {
          throw new Error("Couldn't save that change.");
        }

        setMembers((prev) =>
          prev.map((m) =>
            m._id === id ? { ...m, points: Number(editPoints) || 0 } : m,
          ),
        );
        setEditingIndex(null);
        setError(null);
      } finally {
        setSavingId(null);
      }
    });

  return {
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
    reload: loadMembers,
  };
}