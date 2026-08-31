import { useState, useEffect, useCallback } from "react";
import { API_ROOT } from "./useMembers";
import apiFetch from "../utils/apiFetch";

const API_BASE = `${API_ROOT}/members`;

// `token` no longer used internally — auth now travels via an httpOnly
// session cookie through apiFetch — kept as a parameter so the existing
// call site (AppShell passing auth.token) doesn't need to change.
// `enabled` (isAdmin, computed by the caller from the now-async auth
// check) is the real gate on whether this should load.
export default function useUnlinkedUsers(token, enabled = true) {
  const [unlinkedUsers, setUnlinkedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    return apiFetch(`${API_BASE}/unlinked-users`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setUnlinkedUsers)
      .catch(() => setUnlinkedUsers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  return { unlinkedUsers, loading, reload: load };
}
