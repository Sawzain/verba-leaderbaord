import { useState } from "react";
import { OLIVE, OLIVE_DARK, CREAM, CREAM_DARK, WHITE } from "../theme";
import { StarDisplay, StarInput } from "./StarRating";
import AuthPanel from "./AuthPanel";
import BookForm from "./BookForm";
import { resolveCoverUrl } from "../utils/resolveCoverUrl";

// Shared with LandingPage.jsx's .verba-btn / .verba-btn-outline classes.
// Inline style objects can't express :hover/:active, so interactive
// buttons/links get a matching CSS class defined here alongside their
// inline styles — colors and layout stay inline, this only adds
// transition/hover/active behavior.
const buttonInteractionStyles = `
  .verba-btn {
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, opacity 0.15s ease, color 0.15s ease;
  }
  .verba-btn:hover {
    transform: translateY(-1px);
    filter: brightness(1.06);
  }
  .verba-btn:active {
    transform: translateY(0);
    filter: brightness(0.96);
  }
  .verba-btn:disabled {
    transform: none;
    filter: none;
  }
  .verba-link-btn {
    transition: opacity 0.15s ease, color 0.15s ease;
  }
  .verba-link-btn:hover {
    opacity: 0.7;
  }
  .verba-link-btn:active {
    opacity: 0.5;
  }
`;

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
    ? book.reviews.find((r) => r.userId === auth.user.id)
    : null;

  const submit = async () => {
    if (!rating) {
      setSubmitError("Pick a star rating first.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmitReview(book._id, { rating, text: text.trim() });
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
      <style>{buttonInteractionStyles}</style>

      <button
        onClick={onBack}
        className="verba-link-btn"
        style={{
          background: "none",
          border: "none",
          color: OLIVE_DARK,
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
              await onEditBook(book._id, payload);
              setEditingBook(false);
            }}
            onCancel={() => setEditingBook(false)}
          />
        </div>
      ) : (
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 96,
              height: 128,
              flexShrink: 0,
              borderRadius: 8,
              overflow: "hidden",
              background: "#e4ddc7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {book.coverImage ? (
              <img
                src={resolveCoverUrl(book.coverImage)}
                alt={book.title}
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
                style={{ fontSize: 19, fontWeight: "bold", color: "#2d2d2d" }}
              >
                {book.title}
              </div>
              {isAdminUnlocked && (
                <button
                  onClick={() => setEditingBook(true)}
                  className="verba-link-btn"
                  style={{
                    flexShrink: 0,
                    background: "none",
                    border: "none",
                    color: OLIVE_DARK,
                    fontSize: 12,
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  Edit
                </button>
              )}
            </div>
            {book.author && (
              <div style={{ fontSize: 14, color: OLIVE_DARK, marginTop: 2 }}>
                {book.author}
              </div>
            )}
            {book.avgRating ? (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <StarDisplay value={book.avgRating} size={16} />
                <span style={{ fontSize: 13, color: "#888" }}>
                  {book.avgRating} · {book.reviewCount} review
                  {book.reviewCount !== 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: "#aaa",
                  fontStyle: "italic",
                }}
              >
                No reviews yet — be the first
              </div>
            )}
          </div>
        </div>
      )}

      {/* Write a review */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            color: "#9a9578",
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
              border: `1px dashed ${CREAM_DARK}`,
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              color: OLIVE_DARK,
              cursor: "pointer",
              fontFamily: "'Georgia', serif",
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
                color: OLIVE_DARK,
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
                background: "#eef3e2",
                border: "1px solid #d3e0bd",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 13,
                color: "#3f4d1e",
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
                className="verba-link-btn"
                style={{
                  background: "none",
                  border: "none",
                  color: OLIVE_DARK,
                  fontSize: 12,
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  whiteSpace: "nowrap",
                }}
              >
                Edit
              </button>
            </div>
          )}

        {auth.isLoggedIn && myReview && editingReviewId === myReview.id && (
          <div
            style={{
              background: "#f6f3e8",
              border: `1px solid ${CREAM_DARK}`,
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
                border: `1.5px solid ${CREAM_DARK}`,
                fontSize: 14,
                fontFamily: "'Georgia', serif",
                outline: "none",
                background: WHITE,
                color: "#2d2d2d",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
            {editError && (
              <div style={{ marginTop: 8, fontSize: 13, color: "#a33" }}>
                {editError}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button
                onClick={() => saveEditReview(myReview.id)}
                disabled={editSubmitting}
                className="verba-btn"
                style={{
                  background: "#6B7A3A",
                  color: CREAM,
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontSize: 14,
                  cursor: editSubmitting ? "default" : "pointer",
                  opacity: editSubmitting ? 0.7 : 1,
                  fontFamily: "'Georgia', serif",
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
                  border: `1.5px solid ${CREAM_DARK}`,
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "'Georgia', serif",
                  color: "#2d2d2d",
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
              background: "#f6f3e8",
              border: `1px solid ${CREAM_DARK}`,
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
                border: `1.5px solid ${CREAM_DARK}`,
                fontSize: 14,
                fontFamily: "'Georgia', serif",
                outline: "none",
                background: WHITE,
                color: "#2d2d2d",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
            {submitError && (
              <div style={{ marginTop: 8, fontSize: 13, color: "#a33" }}>
                {submitError}
              </div>
            )}
            <button
              onClick={submit}
              disabled={submitting}
              className="verba-btn"
              style={{
                marginTop: 10,
                background: "#6B7A3A",
                color: CREAM,
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 14,
                cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.7 : 1,
                fontFamily: "'Georgia', serif",
              }}
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </div>
        )}

        {justSubmitted && auth.isLoggedIn && (
          <div
            style={{
              background: "#eef3e2",
              border: "1px solid #d3e0bd",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 13,
              color: "#3f4d1e",
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
          color: "#2d2d2d",
          marginBottom: 14,
        }}
      >
        Reviews{" "}
        {book.reviews.length > 0 && (
          <span style={{ fontSize: 15, fontWeight: "normal", color: "#888" }}>
            ({book.reviews.length})
          </span>
        )}
      </div>

      {book.reviews.length === 0 && (
        <div style={{ color: "#aaa", fontStyle: "italic", fontSize: 14 }}>
          No reviews yet.
        </div>
      )}

      {book.reviews.map((r) => {
        const isMine = auth.user && r.userId === auth.user.id;
        const initial = (r.reviewer || "?").trim().charAt(0).toUpperCase();
        return (
          <div
            key={r.id}
            style={{
              display: "flex",
              gap: 12,
              padding: "14px 16px",
              marginBottom: 10,
              background: WHITE,
              border: `1px solid ${CREAM_DARK}`,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: OLIVE,
                color: CREAM,
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
                  style={{ fontSize: 14, fontWeight: "bold", color: "#2d2d2d" }}
                >
                  {r.reviewer}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <StarDisplay value={r.rating} size={13} />
                  {isMine && editingReviewId !== r.id && (
                    <>
                      <button
                        onClick={() => startEditReview(r)}
                        className="verba-link-btn"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: OLIVE_DARK,
                          fontSize: 11,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveMyReview(r.id)}
                        disabled={removingId === r.id}
                        className="verba-link-btn"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#a33",
                          fontSize: 11,
                          cursor: removingId === r.id ? "default" : "pointer",
                          opacity: removingId === r.id ? 0.6 : 1,
                          padding: 0,
                        }}
                      >
                        {removingId === r.id ? "Deleting…" : "Delete"}
                      </button>
                    </>
                  )}
                  {isAdminUnlocked && !isMine && (
                    <button
                      onClick={() => handleRemoveReview(r.id)}
                      disabled={removingId === r.id}
                      className="verba-link-btn"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#a33",
                        fontSize: 11,
                        cursor: removingId === r.id ? "default" : "pointer",
                        opacity: removingId === r.id ? 0.6 : 1,
                        padding: 0,
                      }}
                    >
                      {removingId === r.id ? "Removing…" : "Remove"}
                    </button>
                  )}
                </div>
              </div>
              {r.text && editingReviewId !== r.id && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: "#444",
                    lineHeight: 1.5,
                  }}
                >
                  {r.text}
                  {r.edited && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        color: "#aaa",
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
