import { useState, useEffect, useCallback } from "react";
import { API_ROOT } from "./useMembers";

const API_BASE = `${API_ROOT}/books`;

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
        setError(
          "Couldn't reach the server. Check your connection and try again.",
        ),
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

  const editBook = async (token, id, { title, author, file }) => {
    const form = new FormData();
    form.append("title", title);
    form.append("author", author);
    if (file) form.append("cover", file);

    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't save those changes");

    let updatedBook = body;
    setBooks((prev) =>
      prev.map((b) => {
        if (b._id === id || b.id === id) {
          updatedBook = { ...b, ...body };
          return updatedBook;
        }
        return b;
      }),
    );
    return updatedBook;
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
    setBooks((prev) => prev.filter((b) => b._id !== id && b.id !== id));
  };

  const setCurrentPick = async (token, id) => {
    const previous = books;
    // Optimistic: flip locally right away so the star responds instantly,
    // instead of waiting on the round-trip to the DB.
    setBooks((prev) =>
      prev.map((b) => {
        const isTarget = b._id === id || b.id === id;
        return { ...b, isCurrentPick: isTarget ? !b.isCurrentPick : false };
      }),
    );

    try {
      const res = await fetch(`${API_BASE}/${id}/current-pick`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(body.error || "Couldn't update the current pick");

      // Reconcile with the server's actual result (in case of a race).
      setBooks((prev) =>
        prev.map((b) => {
          if (b._id === id || b.id === id)
            return { ...b, isCurrentPick: body.isCurrentPick };
          return body.isCurrentPick ? { ...b, isCurrentPick: false } : b;
        }),
      );
      return body;
    } catch (err) {
      setBooks(previous); // roll back
      throw err;
    }
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

    // Refetch books so review count and average rating update in main state
    await loadBooks();
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
    await loadBooks();
  };

  const removeMyReview = async (token, reviewId) => {
    const res = await fetch(`${API_ROOT}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Couldn't remove that review");
    }
    await loadBooks();
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

    await loadBooks();
    return body;
  };

  return {
    books,
    loading,
    error,
    loadBooks,
    fetchBook,
    addBook,
    editBook,
    removeBook,
    setCurrentPick,
    addReview,
    removeReview,
    removeMyReview,
    editReview,
  };
}
