import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SAGE_DARK,
  SAGE_DEEP,
  MUTED,
  PAPER,
  DANGER,
  FONT_SERIF,
} from "../theme";
import Pagination from "./Pagination";
import BookCard from "./BookCard";
import BookForm from "./BookForm";
import BookDetail from "./BookDetail";
import EmptyState from "./EmptyState";
import useSlowLoadHint from "../hooks/useSlowLoadHint";

export default function BooksView({
  books,
  loading,
  error,
  page,
  totalPages,
  goToPage,
  isAdminUnlocked,
  adminKey,
  addBook,
  editBook,
  removeBook,
  setCurrentPick,
  fetchBook,
  addReview,
  removeReview,
  removeMyReview,
  editReview,
  auth,
  initialBookId,
}) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [search, setSearch] = useState("");
  const showSlowHint = useSlowLoadHint(loading);
  const [showAddForm, setShowAddForm] = useState(false);

  // The URL is the source of truth for which book (if any) is open —
  // /app/reviews/:bookId. This effect keeps local selection state in sync
  // with it, so a direct link, a browser back/forward, or a Link from
  // another page all open (or close) the right book on mount.
  useEffect(() => {
    if (initialBookId) {
      openBook(initialBookId);
    } else {
      setSelectedId(null);
      setSelectedBook(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBookId]);

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

  // Grid cards navigate to the book's URL rather than opening it directly —
  // the effect above reacts to that URL change and does the actual fetch.
  // This keeps the URL as the single source of truth for what's open.
  const goToBook = (id) => navigate(`/app/reviews/${id}`);
  const closeBook = () => navigate("/app/reviews");

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

  const handleEditBook = async (bookId, payload) => {
    await editBook(adminKey, bookId, payload);
    await refreshSelected();
  };

  const handleRemove = async (id, title) => {
    if (!window.confirm(`Remove "${title}"? This deletes its reviews too.`))
      return;
    try {
      await removeBook(adminKey, id);
      if (selectedId === id) {
        closeBook();
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

  // AppShell no longer wraps pages in a frosted cream panel, and
  // TwoColumnLayout's "main" slot has no background of its own (its own
  // comment only covers the sidebar) — so BooksView owns its own PAPER
  // card here, same pattern as Leaderboard/Manage/Verba Wall, across both
  // the grid view and the detail-loading/error states below.
  const cardStyle = {
    background: PAPER,
    border: "1px solid rgba(45,51,39,0.08)",
    borderRadius: 14,
  };

  if (selectedId) {
    if (detailLoading) {
      return (
        <div style={cardStyle}>
          <EmptyState message="Loading book…" />
        </div>
      );
    }
    if (detailError || !selectedBook) {
      return (
        <div style={{ ...cardStyle, padding: 24 }}>
          <div style={{ color: DANGER, marginBottom: 12 }}>
            {detailError || "Couldn't load that book."}
          </div>
          <button
            onClick={closeBook}
            style={{
              background: "none",
              border: "none",
              color: SAGE_DEEP,
              cursor: "pointer",
            }}
          >
            ← Back to books
          </button>
        </div>
      );
    }
    return (
      <div style={cardStyle}>
        <BookDetail
          book={selectedBook}
          auth={auth}
          onBack={closeBook}
          onSubmitReview={handleSubmitReview}
          isAdminUnlocked={isAdminUnlocked}
          onRemoveReview={handleRemoveReview}
          onEditReview={handleEditReview}
          onRemoveMyReview={handleRemoveMyReview}
          onEditBook={handleEditBook}
        />
      </div>
    );
  }

  return (
    <div style={{ ...cardStyle, padding: "24px" }}>
      {isAdminUnlocked && (
        <div style={{ marginBottom: 20 }}>
          {showAddForm ? (
            <BookForm
              mode="add"
              onSubmit={async (payload) => {
                await addBook(adminKey, payload);
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                background: "none",
                border: `1.5px dashed ${MUTED}`,
                borderRadius: 10,
                padding: "9px 18px",
                fontSize: 14,
                fontFamily: FONT_SERIF,
                color: SAGE_DEEP,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
              Add a book
            </button>
          )}
        </div>
      )}

      {loading && (
        <div style={{ padding: 20, textAlign: "center", color: MUTED }}>
          <div
            style={{
              width: 28,
              height: 28,
              margin: "0 auto 14px",
              border: `3px solid ${MUTED}`,
              borderTopColor: SAGE_DARK,
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
        <div style={{ color: DANGER, fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {!loading && books.length === 0 && (
        <EmptyState message="No books yet." padding={20} />
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
            border: `1.5px solid ${MUTED}`,
            fontSize: 14,
            fontFamily: FONT_SERIF,
            outline: "none",
            background: PAPER,
            color: SAGE_DEEP,
            boxSizing: "border-box",
            marginBottom: 16,
          }}
        />
      )}

      {!loading && books.length > 0 && visibleBooks.length === 0 && (
        <EmptyState message={`No books match "${search}".`} padding={20} />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 180px))",
          gap: 12,
        }}
      >
        {visibleBooks.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            onOpen={() => goToBook(book._id)}
            canRemove={isAdminUnlocked}
            onRemove={() => handleRemove(book._id, book.title)}
            canManageCurrentPick={isAdminUnlocked}
            onToggleCurrentPick={() => handleToggleCurrentPick(book._id)}
          />
        ))}
      </div>

      {/* Search only filters the currently loaded page, not the whole
          shelf, so Prev/Next is hidden while searching to avoid implying
          there might be more matches on other pages. */}
      {!search.trim() && (
        <Pagination page={page} totalPages={totalPages} goToPage={goToPage} />
      )}
    </div>
  );
}
