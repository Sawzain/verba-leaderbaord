import { useState, useEffect, useCallback } from "react";
import { API_ROOT } from "./useMembers";
import apiFetch from "../utils/apiFetch";

const API_BASE = `${API_ROOT}/books`;

export default function useBooks(enabled = true) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadBooks = useCallback((targetPage = 1) => {
    setLoading(true);
    setError(null);
    return fetch(`${API_BASE}?page=${targetPage}&limit=24`)
      .then((res) => {
        if (!res.ok) throw new Error("Server responded with an error");
        return res.json();
      })
      .then((data) => {
        setBooks(data.books);
        setPage(data.page);
        setTotalPages(data.totalPages);
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
    if (enabled && !hasLoaded) loadBooks(1);
  }, [enabled, hasLoaded, loadBooks]);

  const fetchBook = async (id) => {
    const res = await fetch(`${API_BASE}/${id}`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't load that book");
    return body;
  };

  // `token` params below are no longer used internally — auth now
  // travels via an httpOnly session cookie through apiFetch (see
  // src/utils/apiFetch.js) — but are kept so existing callers passing
  // adminKey/auth.token don't need their call sites changed.
  const addBook = async (token, { title, author, file }) => {
    const form = new FormData();
    form.append("title", title);
    form.append("author", author);
    if (file) form.append("cover", file);

    const res = await apiFetch(API_BASE, {
      method: "POST",
      body: form,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't add that book");

    // Refetch page 1 instead of prepending locally — books are sorted
    // newest-first server-side, so the new book belongs on page 1, and a
    // local splice would let this page silently exceed the page size and
    // leave totalPages stale.
    await loadBooks(1);
    return body;
  };

  const editBook = async (token, id, { title, author, file }) => {
    const form = new FormData();
    form.append("title", title);
    form.append("author", author);
    if (file) form.append("cover", file);

    const res = await apiFetch(`${API_BASE}/${id}`, {
      method: "PUT",
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
    const res = await apiFetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Couldn't remove that book");
    }
    // Refetch the current page rather than filtering locally, so total/
    // totalPages stay accurate and a now-short page can pull in the next
    // book that would otherwise be stuck on the following page.
    await loadBooks(page);
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
      const res = await apiFetch(`${API_BASE}/${id}/current-pick`, {
        method: "PATCH",
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
    const res = await apiFetch(`${API_BASE}/${bookId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating, text }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't submit your review");

    // Refetch books so review count and average rating update in main state
    await loadBooks(page);
    return body;
  };

  const removeReview = async (token, reviewId) => {
    const res = await apiFetch(`${API_ROOT}/reviews/${reviewId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Couldn't remove that review");
    }
    await loadBooks(page);
  };

  const removeMyReview = async (token, reviewId) => {
    const res = await apiFetch(`${API_ROOT}/reviews/${reviewId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Couldn't remove that review");
    }
    await loadBooks(page);
  };

  const editReview = async (token, reviewId, { rating, text }) => {
    const res = await apiFetch(`${API_ROOT}/reviews/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating, text }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't save your changes");

    await loadBooks(page);
    return body;
  };

  return {
    books,
    loading,
    error,
    loadBooks,
    fetchBook,
    page,
    totalPages,
    goToPage: loadBooks,
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
