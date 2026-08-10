import { useState, useEffect, useCallback } from "react";
import { API_ROOT } from "./useMembers";

const API_BASE = `${API_ROOT}/activity`;
const STATS_URL = `${API_ROOT}/members/stats`;

export default function useActivity(enabled = true) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [booksRead, setBooksRead] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    return fetch(API_BASE)
      .then((res) => (res.ok ? res.json() : []))
      .then(setActivity)
      .catch(() => setActivity([]))
      .finally(() => setLoading(false));
  }, []);

  const loadStats = useCallback(() => {
    return fetch(STATS_URL)
      .then((res) => (res.ok ? res.json() : { booksRead: 0 }))
      .then((data) => setBooksRead(data.booksRead || 0))
      .catch(() => setBooksRead(0));
  }, []);

  useEffect(() => {
    if (enabled) {
      load();
      loadStats();
    }
  }, [enabled, load, loadStats]);

  return { activity, loading, booksRead, reload: load };
}
