import { useState, useEffect, useCallback } from "react";
import { API_ROOT } from "./useMembers";

const API_BASE = `${API_ROOT}/books`;

export default function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBooks = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetch(API_BASE)
      .then((res) => {
        if (!res.ok) throw new Error("Server responded with an error");
        return res.json();
      })
      .then(setBooks)
      .catch(() =>
        setError("Couldn't reach the server. Check your connection and try again."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const fetchBook = async (id) => {
    const res = await fetch(`${API_BASE}/${id}`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't load that book");
    return body;
  };

  const addBook = async (adminKey, { title, author, file }) => {
    const form = new FormData();
    form.append("title", title);
    form.append("author", author);
    if (file) form.append("cover", file);

    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "x-api-key": adminKey },
      body: form,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't add that book");

    setBooks((prev) => [{ ...body, avgRating: null, reviewCount: 0 }, ...prev]);
    return body;
  };

  const removeBook = async (adminKey, id) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { "x-api-key": adminKey },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Couldn't remove that book");
    }
    setBooks((prev) => prev.filter((b) => b._id !== id));
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

  const removeReview = async (adminKey, reviewId) => {
    const res = await fetch(`${API_ROOT}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { "x-api-key": adminKey },
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
    addReview,
    removeReview,
    removeMyReview,
    editReview,
  };
}
