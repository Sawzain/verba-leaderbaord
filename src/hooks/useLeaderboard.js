import { useState, useEffect, useCallback } from "react";
import { API_ROOT } from "./useMembers";

const API_BASE = `${API_ROOT}/members`;
const PAGE_SIZE = 10;

// Read-only, paginated view of the leaderboard — separate from
// useMembers.js (which stays full-list, powering Manage's admin edit
// flows and full-roster search). Hits the same GET /api/members
// endpoint, but passing page/limit switches the server into its
// paginated + ranked response mode (see server/routes/members.js).
export default function useLeaderboard(enabled = true) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadPage = useCallback((targetPage = 1) => {
    setLoading(true);
    setError(null);
    return fetch(`${API_BASE}?page=${targetPage}&limit=${PAGE_SIZE}`)
      .then((res) => {
        if (!res.ok) throw new Error("Server responded with an error");
        return res.json();
      })
      .then((data) => {
        setMembers(
          data.members.map((m) => ({
            name: m.username,
            points: m.score,
            _id: m._id,
            rank: m.rank,
            latestActivity: m.latestActivity || null,
          })),
        );
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
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
    if (enabled && !hasLoaded) loadPage(1);
  }, [enabled, hasLoaded, loadPage]);

  return {
    members,
    loading,
    error,
    page,
    totalPages,
    total,
    goToPage: loadPage,
  };
}
