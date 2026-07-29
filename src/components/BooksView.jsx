import { useMemo, useState } from "react";
import { OLIVE, OLIVE_DARK, CREAM_DARK, WHITE } from "../theme";
import BookCard from "./BookCard";
import AddBookForm from "./AddBookForm";
import BookDetail from "./BookDetail";
import AccountBar from "./AccountBar";
import useSlowLoadHint from "../hooks/useSlowLoadHint";

export default function BooksView({
  books,
  loading,
  error,
  isAdminUnlocked,
  adminKey,
  addBook,
  removeBook,
  setCurrentPick,
  fetchBook,
  addReview,
  removeReview,
  removeMyReview,
  editReview,
  auth,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [search, setSearch] = useState("");
  const showSlowHint = useSlowLoadHint(loading);

  const visibleBooks = useMemo(() => {
    if (!search.trim()) return books;
    const q = search.trim().toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q),
    );
  }, [books, search]);

  const openBook = async (id) => {
    setSelectedId(id);
    setSelectedBook(null);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const book = await fetchBook(id);
      setSelectedBook(book);
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshSelected = async () => {
    if (!selectedId) return;
    const book = await fetchBook(selectedId);
    setSelectedBook(book);
  };

  const handleSubmitReview = async (bookId, payload) => {
    await addReview(auth.token, bookId, payload);
    await refreshSelected();
  };

  const handleRemoveReview = async (reviewId) => {
    await removeReview(adminKey, reviewId);
    await refreshSelected();
  };

  const handleRemoveMyReview = async (reviewId) => {
    await removeMyReview(auth.token, reviewId);
    await refreshSelected();
  };

  const handleEditReview = async (reviewId, payload) => {
    await editReview(auth.token, reviewId, payload);
    await refreshSelected();
  };

  const handleRemove = async (id, title) => {
    if (!window.confirm(`Remove "${title}"? This deletes its reviews too.`))
      return;
    try {
      await removeBook(adminKey, id);
      if (selectedId === id) {
        setSelectedId(null);
        setSelectedBook(null);
      }
    } catch (err) {
      window.alert(err.message || "Couldn't remove that book.");
    }
  };

  const handleToggleCurrentPick = async (id) => {
    try {
      await setCurrentPick(adminKey, id);
    } catch (err) {
      window.alert(err.message || "Couldn't update the current pick.");
    }
  };

  if (selectedId) {
    if (detailLoading) {
      return (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "#aaa",
            fontStyle: "italic",
          }}
        >
          Loading book…
        </div>
      );
    }
    if (detailError || !selectedBook) {
      return (
        <div style={{ padding: 24 }}>
          <div style={{ color: "#a33", marginBottom: 12 }}>
            {detailError || "Couldn't load that book."}
          </div>
          <button
            onClick={() => setSelectedId(null)}
            style={{
              background: "none",
              border: "none",
              color: OLIVE_DARK,
              cursor: "pointer",
            }}
          >
            ← Back to books
          </button>
        </div>
      );
    }
    return (
      <div>
        <div style={{ padding: "16px 24px 0" }}>
          <AccountBar auth={auth} />
        </div>
        <BookDetail
          book={selectedBook}
          auth={auth}
          onBack={() => setSelectedId(null)}
          onSubmitReview={handleSubmitReview}
          isAdminUnlocked={isAdminUnlocked}
          onRemoveReview={handleRemoveReview}
          onEditReview={handleEditReview}
          onRemoveMyReview={handleRemoveMyReview}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <AccountBar auth={auth} />

      {isAdminUnlocked && (
        <>
          <div
            style={{
              fontSize: 13,
              color: OLIVE,
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Add a book
          </div>
          <AddBookForm onAdd={(payload) => addBook(adminKey, payload)} />
          <div
            style={{ borderTop: `1px solid ${CREAM_DARK}`, margin: "0 0 20px" }}
          />
        </>
      )}

      {loading && (
        <div style={{ padding: 20, textAlign: "center", color: "#aaa" }}>
          <div
            style={{
              width: 28,
              height: 28,
              margin: "0 auto 14px",
              border: `3px solid ${CREAM_DARK}`,
              borderTopColor: OLIVE,
              borderRadius: "50%",
              animation: "verba-spin 0.8s linear infinite",
            }}
          />
          <div style={{ fontStyle: "italic" }}>Loading books…</div>
          {showSlowHint && (
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
              Still on it — this is taking longer than usual, but hang tight.
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ color: "#a33", fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {!loading && books.length === 0 && (
        <div
          style={{
            padding: 20,
            textAlign: "center",
            color: "#aaa",
            fontStyle: "italic",
          }}
        >
          No books yet.
        </div>
      )}

      {!loading && books.length > 5 && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books or authors…"
          style={{
            width: "100%",
            padding: "8px 14px",
            borderRadius: 10,
            border: `1.5px solid ${CREAM_DARK}`,
            fontSize: 14,
            fontFamily: "'Georgia', serif",
            outline: "none",
            background: WHITE,
            color: "#2d2d2d",
            boxSizing: "border-box",
            marginBottom: 16,
          }}
        />
      )}

      {!loading && books.length > 0 && visibleBooks.length === 0 && (
        <div
          style={{
            padding: 20,
            textAlign: "center",
            color: "#aaa",
            fontStyle: "italic",
          }}
        >
          No books match "{search}".
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 12,
        }}
      >
        {visibleBooks.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            onOpen={() => openBook(book._id)}
            canRemove={isAdminUnlocked}
            onRemove={() => handleRemove(book._id, book.title)}
            canManageCurrentPick={isAdminUnlocked}
            onToggleCurrentPick={() => handleToggleCurrentPick(book._id)}
          />
        ))}
      </div>
    </div>
  );
}
