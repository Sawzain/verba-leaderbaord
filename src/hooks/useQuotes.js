import { useEffect, useState, useCallback } from "react";
import { API_ROOT } from "./useMembers";

const API_BASE = `${API_ROOT}/quotes`;

// Mirrors the shape of useBooks/useMembers: fetch-on-mount, exposes
// loading/error, and a manual refetch. Filtering by book and by source
// (quotes-highlights vs poetry-corner) is done server-side via query
// params so the list stays light.
export default function useQuotes(enabled = true) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [bookFilter, setBookFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState(""); // "" | "quotes-highlights" | "poetry-corner"

  const fetchQuotes = useCallback(async (book = "", source = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (book) params.set("book", book);
      if (source) params.set("source", source);
      const res = await fetch(`${API_BASE}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load quotes");
      const data = await res.json();
      setQuotes(data.quotes ?? []);
    } catch (err) {
      setError(err.message || "Failed to load quotes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) fetchQuotes(bookFilter, sourceFilter);
  }, [enabled, bookFilter, sourceFilter, fetchQuotes]);

  return {
    quotes,
    loading,
    error,
    bookFilter,
    setBookFilter,
    sourceFilter,
    setSourceFilter,
    refetch: () => fetchQuotes(bookFilter, sourceFilter),
  };
}
