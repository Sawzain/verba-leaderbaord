import { useEffect, useState, useCallback } from "react";
import { API_ROOT } from "./useMembers";

const API_BASE = `${API_ROOT}/quotes`;
const PAGE_SIZE = 5;

// Mirrors the shape of useBooks/useMembers: fetch-on-mount, exposes
// loading/error, and pagination. Filtering by book and by source
// (quotes-highlights vs poetry-corner) is done server-side via query
// params, as is the sort — the backend already orders by created_at
// descending (newest first), so no client-side sorting is needed here.
export default function useQuotes(enabled = true) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [bookFilter, setBookFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState(""); // "" | "quotes-highlights" | "poetry-corner"
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchQuotes = useCallback(
    async (book = "", source = "", targetPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (book) params.set("book", book);
        if (source) params.set("source", source);
        params.set("limit", PAGE_SIZE);
        params.set("offset", (targetPage - 1) * PAGE_SIZE);

        const res = await fetch(`${API_BASE}?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load quotes");
        const data = await res.json();
        setQuotes(data.quotes ?? []);
        setPage(targetPage);
        setTotalPages(Math.max(1, Math.ceil((data.total ?? 0) / PAGE_SIZE)));
        setTotal(data.total ?? 0);
      } catch (err) {
        setError(err.message || "Failed to load quotes");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    if (enabled) fetchQuotes(bookFilter, sourceFilter, 1);
  }, [enabled, bookFilter, sourceFilter, fetchQuotes]);

  const goToPage = (targetPage) =>
    fetchQuotes(bookFilter, sourceFilter, targetPage);

  return {
    quotes,
    loading,
    error,
    bookFilter,
    setBookFilter,
    sourceFilter,
    setSourceFilter,
    page,
    totalPages,
    total,
    goToPage,
    refetch: () => fetchQuotes(bookFilter, sourceFilter, page),
  };
}
