import { useState, useEffect, useMemo, useCallback } from "react";
import apiFetch from "../utils/apiFetch";

// In dev, Vite proxies /api to the Express server (see vite.config.js),
// so the frontend never needs to know the backend's host or port.
// In prod, set VITE_API_BASE if the API is served from a different origin.
export const API_ROOT = import.meta.env.VITE_API_BASE || "/api";
const API_BASE = `${API_ROOT}/members`;

// `enabled` lets callers (AppShell) defer fetching members until a tab that
// actually needs them is active, instead of fetching on every /app/* mount
// regardless of which tab you're on. Once loaded, `hasLoaded` keeps the
// data cached so switching tabs back and forth doesn't refetch.
// `token` is no longer used internally (auth now travels via an httpOnly
// session cookie through apiFetch — see src/utils/apiFetch.js) but is
// kept as a parameter so existing callers passing auth.token don't need
// to change their call site.
export default function useMembers(token, enabled = true) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [search, setSearch] = useState("");

  const [newName, setNewName] = useState("");
  // Starting score for a brand-new member — mainly useful when migrating
  // someone who already has books read elsewhere (e.g. a legacy sheet)
  // rather than everyone starting at 0. Kept as a string in state so the
  // input can be empty while typing; coerced to a number on submit.
  const [newPoints, setNewPoints] = useState("");
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
          data.map((m) => ({
            name: m.username,
            points: m.score,
            _id: m._id,
            userId: m.userId || null,
            latestActivity: m.latestActivity || null,
          })),
        );
        setHasLoaded(true);
      })
      .catch(() =>
        setError(
          "Couldn't reach the server. Check your connection and try again.",
        ),
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
    const q = search.trim().toLowerCase();
    const list = q
      ? members.filter((m) => m.name.toLowerCase().includes(q))
      : members;
    // Manage view intentionally does NOT sort by points — admins are
    // editing scores here, and re-sorting on every +/- would make rows
    // jump around mid-edit. Stable alphabetical order instead. The
    // points-sorted view for the public Leaderboard is `sorted`, above.
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [members, search]);

  const withAuthError = async (fn) => {
    try {
      return await fn();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      return null;
    }
  };

  const addMember = (bookId) =>
    withAuthError(async () => {
      if (!newName.trim()) return;
      const startingScore = Math.max(0, Number(newPoints) || 0);
      const response = await apiFetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newName.trim(),
          score: startingScore,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Your admin session was rejected. Please log in again.",
        );
      }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Couldn't add that member.");
      }

      const saved = await response.json();
      let finalScore = saved.score;

      // If a book was selected in the dropdown, log it as read too —
      // reuses the same endpoint MemberRow's "+" button hits, so points
      // and ActivityLog stay consistent with that flow.
      if (bookId) {
        try {
          const readRes = await apiFetch(`${API_BASE}/${saved._id}/mark-read`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ bookId }),
          });
          if (readRes.ok) {
            const readBody = await readRes.json();
            finalScore = readBody.score ?? finalScore;
          }
        } catch {
          // Non-fatal — member was still created successfully.
        }
      }

      setMembers((prev) => [
        ...prev,
        { name: saved.username, points: finalScore, _id: saved._id },
      ]);
      setNewName("");
      setNewPoints("");
      setError(null);
    });

  const removeMember = (id) =>
    withAuthError(async () => {
      const response = await apiFetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Your admin session was rejected. Please log in again.",
        );
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
      // Read the current value synchronously from `members` — setMembers's
      // updater function doesn't run until React's render phase, so a
      // variable only assigned inside that updater isn't populated yet by
      // the time the code right after setMembers() runs.
      const current = members.find((m) => m._id === id);
      const previousPoints = current ? current.points : 0;
      const nextPoints = Math.max(0, previousPoints + delta);

      setMembers((prev) =>
        prev.map((m) => (m._id === id ? { ...m, points: nextPoints } : m)),
      );

      setSavingId(id);
      try {
        const response = await apiFetch(`${API_BASE}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ score: nextPoints }),
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your admin session was rejected. Please log in again.",
          );
        }
        if (!response.ok) {
          throw new Error("Couldn't save that change.");
        }
        setError(null);
      } catch (err) {
        // roll back the optimistic update
        setMembers((prev) =>
          prev.map((m) =>
            m._id === id ? { ...m, points: previousPoints } : m,
          ),
        );
        throw err;
      } finally {
        setSavingId(null);
      }
    });
  const markRead = (id, bookId) =>
    withAuthError(async () => {
      const current = members.find((m) => m._id === id);
      const previousPoints = current ? current.points : 0;
      const nextPoints = previousPoints + 1;

      setMembers((prev) =>
        prev.map((m) => (m._id === id ? { ...m, points: nextPoints } : m)),
      );

      setSavingId(id);
      try {
        const response = await apiFetch(`${API_BASE}/${id}/mark-read`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookId }),
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your admin session was rejected. Please log in again.",
          );
        }
        if (!response.ok) {
          if (response.status === 409) {
            throw new Error(
              "This member is already marked as having read that book.",
            );
          }
          throw new Error("Couldn't mark that book as read.");
        }
        setError(null);
      } catch (err) {
        setMembers((prev) =>
          prev.map((m) =>
            m._id === id ? { ...m, points: previousPoints } : m,
          ),
        );
        throw err;
      } finally {
        setSavingId(null);
      }
    });

  const linkAccount = (id, userId) =>
    withAuthError(async () => {
      setSavingId(id);
      try {
        const response = await apiFetch(`${API_BASE}/${id}/link`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your admin session was rejected. Please log in again.",
          );
        }
        if (!response.ok) {
          throw new Error("Couldn't link that account.");
        }

        setMembers((prev) =>
          prev.map((m) => (m._id === id ? { ...m, userId } : m)),
        );
        setError(null);
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
      const nextPoints = Math.max(0, Number(editPoints) || 0);

      // Optimistic, same as adjustPoints — update immediately, roll back
      // on failure so a rejected save doesn't leave a stale/unsaved number
      // showing in the UI until the next refresh.
      const current = members.find((m) => m._id === id);
      const previousPoints = current ? current.points : 0;

      setMembers((prev) =>
        prev.map((m) => (m._id === id ? { ...m, points: nextPoints } : m)),
      );
      setEditingIndex(null);

      try {
        const response = await apiFetch(`${API_BASE}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ score: nextPoints }),
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your admin session was rejected. Please log in again.",
          );
        }
        if (!response.ok) {
          throw new Error("Couldn't save that change.");
        }

        setError(null);
      } catch (err) {
        // roll back the optimistic update
        setMembers((prev) =>
          prev.map((m) =>
            m._id === id ? { ...m, points: previousPoints } : m,
          ),
        );
        throw err;
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
    markRead,
    linkAccount,
    reload: loadMembers,
  };
}
