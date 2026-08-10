import { useState, useEffect, useCallback } from "react";
import { API_ROOT } from "./useMembers";

const API_BASE = `${API_ROOT}/activity`;

export default function useActivity(enabled = true) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(enabled);

  const load = useCallback(() => {
    setLoading(true);
    return fetch(API_BASE)
      .then((res) => (res.ok ? res.json() : []))
      .then(setActivity)
      .catch(() => setActivity([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  return { activity, loading, reload: load };
}