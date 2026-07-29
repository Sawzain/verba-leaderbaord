import { useState, useEffect, useCallback } from "react";
import { API_ROOT } from "./useMembers";

const API_BASE = `${API_ROOT}/books`;

// `enabled` lets callers (AppShell) defer fetching books until a tab that
// actually needs them is active, instead of fetching on every /app/* mount
// regardless of which tab you're on. Once loaded, `hasLoaded` keeps the
// data cached so switching tabs back and forth doesn't refetch.
// LandingPage calls this with no argument (enabled defaults to true) since
// it always needs the book list for the "current pick" teaser.
export default function useBooks(enabled = true) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadBooks = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetch(API_BASE)
      .then((res) => {
        if (!res.ok) throw new Error("Server responded with an error");
        return res.json();
      })
      .then((data) => {
        setBooks(data);
        setHasLoaded(true);
      })
      .catch(() =>
        setError("Couldn't reach the server. Check your connection and try again."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (enabled && !hasLoaded) loadBooks();
  }, [enabled, hasLoaded, loadBooks]);

  const fetchBook = async (id) => {
    const res = await fetch(`${API_BASE}/${id}`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't load that book");
    return body;
  };

  const addBook = async (token, { title, author, file }) => {
    const form = new FormData();
    form.append("title", title);
    form.append("author", author);
    if (file) form.append("cover", file);

    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't add that book");

    setBooks((prev) => [{ ...body, avgRating: null, reviewCount: 0 }, ...prev]);
    return body;
  };

  const removeBook = async (token, id) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Couldn't remove that book");
    }
    setBooks((prev) => prev.filter((b) => b._id !== id));
  };

  // Admin-only: mark a book as the manually-chosen "current pick" shown on
  // the landing page. The server clears the flag on every other book when
  // one is newly selected, so this mirrors that locally instead of
  // re-fetching the whole list.
  const setCurrentPick = async (token, id) => {
    const res = await fetch(`${API_BASE}/${id}/current-pick`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't update the current pick");

    setBooks((prev) =>
      prev.map((b) => {
        if (b._id === id) return { ...b, isCurrentPick: body.isCurrentPick };
        return body.isCurrentPick ? { ...b, isCurrentPick: false } : b;
      }),
    );
    return body;
  };

  const addReview = async (token, bookId, { rating, text }) => {
    const res = await fetch(`${API_BASE}/${bookId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, text }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't submit your review");
    return body;
  };

  const removeReview = async (token, reviewId) => {
    const res = await fetch(`${API_ROOT}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Couldn't remove that review");
    }
  };

  // Member removing their own review, authenticated with their login token
  // instead of the admin key.
  const removeMyReview = async (token, reviewId) => {
    const res = await fetch(`${API_ROOT}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Couldn't remove that review");
    }
  };

  const editReview = async (token, reviewId, { rating, text }) => {
    const res = await fetch(`${API_ROOT}/reviews/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, text }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't save your changes");
    return body;
  };

  return {
    books,
    loading,
    error,
    loadBooks,
    fetchBook,
    addBook,
    removeBook,
    setCurrentPick,
    addReview,
    removeReview,
    removeMyReview,
    editReview,
  };
}