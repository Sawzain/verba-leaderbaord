import { useEffect, useState, useCallback, useRef } from "react";
import { API_ROOT } from "./useMembers";
import apiFetch from "../utils/apiFetch";

const API_BASE = `${API_ROOT}/quotes`;
const PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 350;

export default function useQuotes(enabled = true) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [bookFilter, setBookFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState(""); // "" | "quotes-highlights" | "poetry-corner"
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest"); // "latest" | "interactions"
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [bookOptions, setBookOptions] = useState([]);

  const fetchQuotes = useCallback(
    async (
      book = "",
      source = "",
      favOnly = false,
      searchText = "",
      sortValue = "latest",
      targetPage = 1,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (book) params.set("book", book);
        if (source) params.set("source", source);
        if (favOnly) params.set("favoriteOnly", "true");
        if (searchText.trim()) params.set("q", searchText.trim());
        if (sortValue && sortValue !== "latest") params.set("sort", sortValue);
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

  // Debounced: reset to page 1 whenever a filter or the search text changes.
  // A single shared debounce covers all of them — the delay is imperceptible
  // for filter chips/tabs (which aren't typed) and is exactly what stops the
  // search box from firing a request on every keystroke.
  const debounceRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchQuotes(bookFilter, sourceFilter, favoriteOnly, search, sort, 1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [
    enabled,
    bookFilter,
    sourceFilter,
    favoriteOnly,
    search,
    sort,
    fetchQuotes,
  ]);

  // Distinct book-title list for the filter chips — fetched once, not
  // derived from the paginated `quotes` array (which only ever holds the
  // current page and would make chips appear/disappear as you paginate).
  useEffect(() => {
    if (!enabled) return;
    fetch(`${API_BASE}/books`)
      .then((res) => (res.ok ? res.json() : { books: [] }))
      .then((data) => setBookOptions(data.books ?? []))
      .catch(() => setBookOptions([]));
  }, [enabled]);

  const goToPage = (targetPage) =>
    fetchQuotes(
      bookFilter,
      sourceFilter,
      favoriteOnly,
      search,
      sort,
      targetPage,
    );

  // `token` no longer used internally — auth now travels via an httpOnly
  // session cookie through apiFetch — kept so existing callers don't
  // need their call sites changed.
  const toggleFavorite = async (token, quoteId, nextValue) => {
    const res = await apiFetch(`${API_BASE}/${quoteId}/favorite`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ favorite: nextValue }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't update favorite");
    await fetchQuotes(
      bookFilter,
      sourceFilter,
      favoriteOnly,
      search,
      sort,
      page,
    );
    return body;
  };

  const deleteQuote = async (token, quoteId) => {
    const res = await apiFetch(`${API_BASE}/${quoteId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Couldn't delete that quote");
    }
    await fetchQuotes(
      bookFilter,
      sourceFilter,
      favoriteOnly,
      search,
      sort,
      page,
    );
  };

  return {
    quotes,
    loading,
    error,
    bookOptions,
    bookFilter,
    setBookFilter,
    sourceFilter,
    setSourceFilter,
    favoriteOnly,
    setFavoriteOnly,
    search,
    setSearch,
    sort,
    setSort,
    page,
    totalPages,
    total,
    goToPage,
    toggleFavorite,
    deleteQuote,
    refetch: () =>
      fetchQuotes(bookFilter, sourceFilter, favoriteOnly, search, sort, page),
  };
}
