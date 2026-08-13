import { useState } from "react";
import {
  SAGE_DARK,
  SAGE_DEEP,
  PAPER,
  MUTED,
  SAGE,
  SAGE_TINT,
  FONT_SERIF,
  FONT_SANS,
  DANGER,
  DANGER_LIGHT,
  CLAY,
} from "../theme";
import { StarDisplay, StarInput } from "./StarRating";
import AuthPanel from "./AuthPanel";
import BookForm from "./BookForm";
import { resolveCoverUrl } from "../utils/resolveCoverUrl";
import EmptyState from "./EmptyState";
import RatingSummary from "./RatingSummary";
import { buttonInteractionStyles } from "../styles/buttonInteractions";

export default function BookDetail({
  book,
  auth,
  onBack,
  onSubmitReview,
  isAdminUnlocked,
  onRemoveReview,
  onEditReview,
  onRemoveMyReview,
  onEditBook,
}) {
  const [editingBook, setEditingBook] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const [showAuthForm, setShowAuthForm] = useState(false);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);

  const [resendBusy, setResendBusy] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

  // Safely derive reviews list, count, and average rating
  const reviews = book?.reviews || [];
  const bookId = book?._id || book?.id;
  const reviewCount = book?.reviewCount ?? reviews.length;
  const avgRating =
    book?.avgRating ??
    (reviews.length > 0
      ? Math.round(
          (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10,
        ) / 10
      : null);

  const handleRemoveReview = async (reviewId) => {
    if (!window.confirm("Remove this review? This can't be undone.")) return;
    setRemovingId(reviewId);
    try {
      await onRemoveReview(reviewId);
    } catch (err) {
      window.alert(err.message || "Couldn't remove that review.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleRemoveMyReview = async (reviewId) => {
    if (!window.confirm("Delete your review? This can't be undone.")) return;
    setRemovingId(reviewId);
    try {
      await onRemoveMyReview(reviewId);
    } catch (err) {
      window.alert(err.message || "Couldn't delete your review.");
    } finally {
      setRemovingId(null);
    }
  };

  const startEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditText(review.text || "");
    setEditError(null);
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditError(null);
  };

  const saveEditReview = async (reviewId) => {
    if (!editRating) {
      setEditError("Pick a star rating first.");
      return;
    }
    setEditSubmitting(true);
    setEditError(null);
    try {
      await onEditReview(reviewId, {
        rating: editRating,
        text: editText.trim(),
      });
      setEditingReviewId(null);
    } catch (err) {
      setEditError(err.message || "Couldn't save your changes.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const myReview = auth.user
    ? reviews.find((r) => r.userId === auth.user.id)
    : null;

  const submit = async () => {
    if (!rating) {
      setSubmitError("Pick a star rating first.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmitReview(bookId, { rating, text: text.trim() });
      setJustSubmitted(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resendVerificationEmail = async () => {
    setResendBusy(true);
    setResendMessage(null);
    try {
      await auth.resendVerification();
      setResendMessage("Verification email sent — check your inbox.");
    } catch (err) {
      setResendMessage(err.message || "Couldn't resend that email.");
    } finally {
      setResendBusy(false);
    }
  };

  return (
    <div style={{ padding: "20px 24px" }}>
      <button
        onClick={onBack}
        className="verba-link-btn"
        style={{
          background: "none",
          border: "none",
          color: SAGE_DEEP,
          fontSize: 13,
          cursor: "pointer",
          padding: 0,
          marginBottom: 16,
        }}
      >
        ← Back to books
      </button>

      {editingBook ? (
        <div style={{ marginBottom: 20 }}>
          <BookForm
            mode="edit"
            initialValues={{
              title: book.title,
              author: book.author,
              coverImage: book.coverImage,
            }}
            onSubmit={async (payload) => {
              await onEditBook(bookId, payload);
              setEditingBook(false);
            }}
            onCancel={() => setEditingBook(false)}
          />
        </div>
      ) : (
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          <div
            style={{
              width: 96,
              height: 128,
              flexShrink: 0,
              borderRadius: 8,
              overflow: "hidden",
              background: `${SAGE}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {book.coverImage ? (
              <img
                src={resolveCoverUrl(book.coverImage)}
                alt={book.title}
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 28, opacity: 0.4 }}>📖</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <div
                style={{ fontSize: 19, fontWeight: "bold", color: SAGE_DEEP }}
              >
                {book.title}
              </div>
              {isAdminUnlocked && (
                <button
                  onClick={() => setEditingBook(true)}
                  className="verba-btn"
                  aria-label="Edit book"
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 26,
                    height: 26,
                    marginRight: 16,
                    background: "transparent",
                    border: `1.5px solid ${MUTED}`,
                    borderRadius: 8,
                    color: SAGE_DEEP,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
              )}
            </div>
            {book.author && (
              <div style={{ fontSize: 14, color: SAGE_DEEP, marginTop: 2 }}>
                {book.author}
              </div>
            )}
            <RatingSummary
              rating={avgRating}
              count={reviewCount}
              starSize={16}
              textSize={13}
              emptyMessage="No reviews yet — be the first"
              wrapperStyle={{ marginTop: 8 }}
            />
          </div>
        </div>
      )}

      {/* Write a review */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            color: SAGE_DARK,
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Write a review
        </div>

        {!auth.isLoggedIn && !showAuthForm && (
          <button
            onClick={() => setShowAuthForm(true)}
            className="verba-btn"
            style={{
              background: "none",
              border: `1px dashed ${MUTED}`,
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              color: SAGE_DEEP,
              cursor: "pointer",
              fontFamily: FONT_SERIF,
              width: "100%",
              textAlign: "left",
            }}
          >
            Log in to write a review →
          </button>
        )}

        {!auth.isLoggedIn && showAuthForm && (
          <div>
            <AuthPanel
              authError={auth.authError}
              setAuthError={auth.setAuthError}
              authBusy={auth.authBusy}
              onRegister={auth.register}
              onLogin={auth.login}
              onForgotPassword={auth.forgotPassword}
              discordLoginUrl={auth.discordLoginUrl}
            />
            <button
              onClick={() => setShowAuthForm(false)}
              className="verba-link-btn"
              style={{
                background: "none",
                border: "none",
                color: SAGE_DEEP,
                fontSize: 12,
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
                marginTop: 8,
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {auth.isLoggedIn &&
          auth.user &&
          auth.user.requireEmailVerification &&
          !auth.user.emailVerified &&
          !myReview &&
          !justSubmitted && (
            <div
              style={{
                background: "#fff8e1",
                border: "1px solid #e0c97a",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 13,
                color: "#6b5410",
              }}
            >
              <div>
                Verify your email to submit a review — check your inbox for the
                link we sent.
              </div>
              <button
                onClick={resendVerificationEmail}
                disabled={resendBusy}
                className="verba-link-btn"
                style={{
                  marginTop: 8,
                  background: "none",
                  border: "none",
                  color: "#6b5410",
                  fontSize: 12,
                  textDecoration: "underline",
                  cursor: resendBusy ? "default" : "pointer",
                  padding: 0,
                }}
              >
                {resendBusy ? "Sending…" : "Resend verification email"}
              </button>
              {resendMessage && (
                <div style={{ marginTop: 6, fontSize: 12 }}>
                  {resendMessage}
                </div>
              )}
            </div>
          )}

        {auth.isLoggedIn &&
          myReview &&
          !justSubmitted &&
          editingReviewId !== myReview.id && (
            <div
              style={{
                background: SAGE_TINT,
                border: `1px solid ${SAGE_DARK}33`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 13,
                color: SAGE_DEEP,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span>
                You already reviewed this book — thanks! ({myReview.rating}/5)
              </span>
              <button
                onClick={() => startEditReview(myReview)}
                className="verba-btn"
                aria-label="Edit review"
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  marginRight: 2,
                  background: "transparent",
                  border: `1.5px solid ${MUTED}`,
                  borderRadius: 8,
                  color: SAGE_DEEP,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
            </div>
          )}

        {auth.isLoggedIn && myReview && editingReviewId === myReview.id && (
          <div
            style={{
              background: `${MUTED}66`,
              border: `1px solid ${MUTED}`,
              borderRadius: 12,
              padding: "16px",
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <StarInput value={editRating} onChange={setEditRating} />
            </div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="What did you think? (optional)"
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1.5px solid ${MUTED}`,
                fontSize: 14,
                fontFamily: FONT_SERIF,
                outline: "none",
                background: PAPER,
                color: SAGE_DEEP,
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
            {editError && (
              <div style={{ marginTop: 8, fontSize: 13, color: DANGER }}>
                {editError}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button
                onClick={() => saveEditReview(myReview.id)}
                disabled={editSubmitting}
                className="verba-btn"
                style={{
                  background: SAGE_DARK,
                  color: PAPER,
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontSize: 14,
                  cursor: editSubmitting ? "default" : "pointer",
                  opacity: editSubmitting ? 0.7 : 1,
                  fontFamily: FONT_SERIF,
                }}
              >
                {editSubmitting ? "Saving…" : "Save changes"}
              </button>
              <button
                onClick={cancelEditReview}
                disabled={editSubmitting}
                className="verba-btn"
                style={{
                  background: "none",
                  border: `1.5px solid ${MUTED}`,
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: FONT_SERIF,
                  color: SAGE_DEEP,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {auth.isLoggedIn && !myReview && !justSubmitted && (
          <div
            style={{
              background: `${MUTED}66`,
              border: `1px solid ${MUTED}`,
              borderRadius: 12,
              padding: "16px",
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <StarInput value={rating} onChange={setRating} />
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What did you think? (optional)"
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1.5px solid ${MUTED}`,
                fontSize: 14,
                fontFamily: FONT_SERIF,
                outline: "none",
                background: PAPER,
                color: SAGE_DEEP,
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
            {submitError && (
              <div style={{ marginTop: 8, fontSize: 13, color: DANGER }}>
                {submitError}
              </div>
            )}
            <button
              onClick={submit}
              disabled={submitting}
              className="verba-btn"
              style={{
                marginTop: 10,
                background: SAGE_DARK,
                color: PAPER,
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 14,
                cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.7 : 1,
                fontFamily: FONT_SERIF,
              }}
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </div>
        )}

        {justSubmitted && auth.isLoggedIn && (
          <div
            style={{
              background: SAGE_TINT,
              border: `1px solid ${SAGE_DARK}33`,
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 13,
              color: SAGE_DEEP,
            }}
          >
            Thanks for reviewing! Your rating has been added.
          </div>
        )}
      </div>

      {/* Reviews list */}
      <div
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: SAGE_DEEP,
          marginBottom: 10,
        }}
      >
        Reviews{" "}
        {reviews.length > 0 && (
          <span
            style={{ fontSize: 15, fontWeight: "normal", color: SAGE_DARK }}
          >
            ({reviews.length})
          </span>
        )}
      </div>

      {reviews.length === 0 && <EmptyState message={"No reviews yet."} />}

      {reviews.map((r) => {
        const isMine = auth.user && r.userId === auth.user.id;
        const initial = (r.reviewer || "?").trim().charAt(0).toUpperCase();
        return (
          <div
            key={r.id || r._id}
            style={{
              display: "flex",
              gap: 12,
              padding: "14px 16px",
              marginBottom: 10,
              background: SAGE_TINT,
              border: `1px solid ${MUTED}`,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: SAGE_DARK,
                color: PAPER,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: SAGE_DEEP,
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.reviewer}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  <StarDisplay value={r.rating} size={13} />
                  {isMine && editingReviewId !== r.id && (
                    <>
                      <button
                        onClick={() => startEditReview(r)}
                        className="verba-btn"
                        aria-label="Edit review"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 26,
                          height: 26,
                          background: "transparent",
                          border: `1.5px solid ${MUTED}`,
                          borderRadius: 8,
                          color: SAGE_DEEP,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemoveMyReview(r.id)}
                        disabled={removingId === r.id}
                        className="verba-btn"
                        aria-label="Delete review"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 26,
                          height: 26,
                          background: "transparent",
                          border: `1.5px solid ${DANGER_LIGHT}`,
                          borderRadius: 8,
                          color: DANGER,
                          cursor: removingId === r.id ? "default" : "pointer",
                          opacity: removingId === r.id ? 0.6 : 1,
                          padding: 0,
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        </svg>
                      </button>
                    </>
                  )}
                  {isAdminUnlocked && !isMine && (
                    <button
                      onClick={() => handleRemoveReview(r.id)}
                      disabled={removingId === r.id}
                      className="verba-btn"
                      aria-label="Remove review"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 26,
                        height: 26,
                        background: "transparent",
                        border: `1.5px solid ${DANGER_LIGHT}`,
                        borderRadius: 8,
                        color: DANGER,
                        cursor: removingId === r.id ? "default" : "pointer",
                        opacity: removingId === r.id ? 0.6 : 1,
                        padding: 0,
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {r.text && editingReviewId !== r.id && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: SAGE_DEEP,
                    lineHeight: 1.5,
                  }}
                >
                  {r.text}
                  {r.edited && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        color: SAGE,
                        fontStyle: "italic",
                      }}
                    >
                      (edited)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
