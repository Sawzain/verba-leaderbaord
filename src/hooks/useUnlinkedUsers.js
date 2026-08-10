import { useState, useEffect, useCallback } from "react";
import { API_ROOT } from "./useMembers";

const API_BASE = `${API_ROOT}/members`;

export default function useUnlinkedUsers(token, enabled = true) {
  const [unlinkedUsers, setUnlinkedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    return fetch(`${API_BASE}/unlinked-users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setUnlinkedUsers)
      .catch(() => setUnlinkedUsers([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  return { unlinkedUsers, loading, reload: load };
}
