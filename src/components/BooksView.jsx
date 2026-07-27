import { useState } from "react";
import { OLIVE, OLIVE_DARK, CREAM_DARK } from "../theme";
import BookCard from "./BookCard";
import AddBookForm from "./AddBookForm";
import BookDetail from "./BookDetail";

export default function BooksView({
  books,
  loading,
  error,
  isAdminUnlocked,
  adminKey,
  addBook,
  removeBook,
  fetchBook,
  addReview,
  auth,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

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

  const handleRemove = async (id, title) => {
    if (!window.confirm(`Remove "${title}"? This deletes its reviews too.`)) return;
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

  if (selectedId) {
    if (detailLoading) {
      return (
        <div style={{ padding: 40, textAlign: "center", color: "#aaa", fontStyle: "italic" }}>
          Loading book…
        </div>
      );
    }
    if (detailError || !selectedBook) {
      return (
        <div style={{ padding: 24 }}>
          <div style={{ color: "#a33", marginBottom: 12 }}>{detailError || "Couldn't load that book."}</div>
          <button
            onClick={() => setSelectedId(null)}
            style={{ background: "none", border: "none", color: OLIVE_DARK, cursor: "pointer" }}
          >
            ← Back to books
          </button>
        </div>
      );
    }
    return (
      <BookDetail
        book={selectedBook}
        auth={auth}
        onBack={() => setSelectedId(null)}
        onSubmitReview={handleSubmitReview}
      />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
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
          <div style={{ borderTop: `1px solid ${CREAM_DARK}`, margin: "0 0 20px" }} />
        </>
      )}

      {loading && (
        <div style={{ padding: 20, textAlign: "center", color: "#aaa", fontStyle: "italic" }}>
          Loading books…
        </div>
      )}

      {error && <div style={{ color: "#a33", fontSize: 13, marginBottom: 12 }}>{error}</div>}

      {!loading && books.length === 0 && (
        <div style={{ padding: 20, textAlign: "center", color: "#aaa", fontStyle: "italic" }}>
          No books yet.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 12,
        }}
      >
        {books.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            onOpen={() => openBook(book._id)}
            canRemove={isAdminUnlocked}
            onRemove={() => handleRemove(book._id, book.title)}
          />
        ))}
      </div>
    </div>
  );
}
