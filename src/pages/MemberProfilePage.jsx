import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthContext } from "../AuthContext";
import useMemberProfile from "../hooks/useMemberProfile";
import Pagination from "../components/Pagination";
import {
  SAGE,
  SAGE_DARK,
  SAGE_DEEP,
  PAPER,
  MUTED,
  CLAY,
  SAGE_TINT,
  FONT_SERIF,
  avatarColor,
  initials,
} from "../theme";

const primaryBtn = {
  background: SAGE_DEEP,
  color: PAPER,
  border: "none",
  borderRadius: 10,
  padding: "8px 18px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const secondaryBtn = {
  background: PAPER,
  color: SAGE_DEEP,
  border: `1.5px solid ${SAGE_DEEP}`,
  borderRadius: 10,
  padding: "8px 18px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

export default function MemberProfilePage() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const {
    profile,
    genres,
    loading,
    error,
    saving,
    updateProfile,
    reviewsPage,
    reviewsTotalPages,
    goToReviewsPage,
  } = useMemberProfile(id);
  const [editing, setEditing] = useState(false);
  const [draftBio, setDraftBio] = useState("");
  const [draftGenres, setDraftGenres] = useState([]);
  const [booksExpanded, setBooksExpanded] = useState(false);

  const MAX_GENRES = 5;

  if (loading)
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: MUTED,
          fontStyle: "italic",
        }}
      >
        Loading…
      </div>
    );
  if (error || !profile)
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: MUTED,
          fontStyle: "italic",
        }}
      >
        {error || "Not found."}
      </div>
    );

  const isOwner = user && profile.userId && user.id === profile.userId;

  const startEditing = () => {
    setDraftBio(profile.bio || "");
    setDraftGenres(profile.favoriteGenres || []);
    setEditing(true);
  };

  const save = async () => {
    const ok = await updateProfile({
      bio: draftBio,
      favoriteGenres: draftGenres,
    });
    if (ok) setEditing(false);
  };

  const toggleGenre = (g) =>
    setDraftGenres((prev) => {
      if (prev.includes(g)) return prev.filter((x) => x !== g);
      if (prev.length >= MAX_GENRES) return prev;
      return [...prev, g];
    });

  return (
    <div
      style={{
        padding: "24px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      <Link
        to="/app/leaderboard"
        style={{
          color: SAGE_DEEP,
          fontSize: 13,
          textDecoration: "underline",
        }}
      >
        ← Back to leaderboard
      </Link>

      <div
        style={{
          background: PAPER,
          borderRadius: 16,
          padding: "22px 24px",
          marginTop: 18,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: avatarColor(profile.name),
                color: PAPER,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: "bold",
                flexShrink: 0,
              }}
            >
              {initials(profile.name)}
            </div>
          )}
          <div>
            <h1
              style={{
                fontFamily: FONT_SERIF,
                color: SAGE_DEEP,
                margin: 0,
                fontSize: 26,
              }}
            >
              {profile.name}
            </h1>
            <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>
              {profile.points} book{profile.points !== 1 ? "s" : ""} read
            </div>
          </div>
        </div>

        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: SAGE_DARK,
            letterSpacing: "0.5px",
            marginBottom: 10,
          }}
        >
          BOOKS READ
        </div>

        {(!profile.booksRead || profile.booksRead.length === 0) && (
          <div
            style={{
              color: MUTED,
              fontStyle: "italic",
              fontSize: 14,
            }}
          >
            No books read yet.
          </div>
        )}

        {profile.booksRead?.length > 0 && (
          <div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {(booksExpanded
                ? profile.booksRead
                : profile.booksRead.slice(0, 3)
              ).map((title, i, arr) => (
                <li
                  key={`${title}-${i}`}
                  style={{
                    padding: "9px 4px",
                    borderBottom:
                      i < arr.length - 1 ? `1px solid ${SAGE}55` : "none",
                    color: SAGE_DEEP,
                    fontSize: 14,
                  }}
                >
                  {title}
                </li>
              ))}
            </ul>
            {profile.booksRead.length > 3 && (
              <button
                className="verba-link-btn"
                onClick={() => setBooksExpanded((v) => !v)}
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
                {booksExpanded
                  ? "Show less"
                  : `Show ${profile.booksRead.length - 3} more`}
              </button>
            )}
          </div>
        )}

        {!profile.linked && (
          <div
            style={{
              background: SAGE,
              borderRadius: 12,
              padding: "14px 16px",
              color: SAGE_DEEP,
              fontStyle: "italic",
              fontSize: 14,
              marginTop: 16,
            }}
          >
            Link your Discord account to unlock your full profile — bio,
            favorite genres, and reviews will show up here once connected.
          </div>
        )}

        {profile.linked && !editing && (
          <>
          <div
            style={{
              background: `${SAGE}66`,
              border: `1px solid ${SAGE}`,
              borderRadius: 12,
              padding: "16px 18px",
              marginTop: 20,
            }}
          >
            {profile.bio && (
              <p
                style={{
                  color: SAGE_DEEP,
                  fontSize: 15,
                  lineHeight: 1.5,
                  marginTop: 0,
                }}
              >
                {profile.bio}
              </p>
            )}

            {profile.favoriteGenres?.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: isOwner ? 16 : 0,
                }}
              >
                {profile.favoriteGenres.map((g) => (
                  <span
                    key={g}
                    style={{
                      background: SAGE_TINT,
                      color: SAGE_DEEP,
                      borderRadius: 20,
                      padding: "4px 12px",
                      fontSize: 12,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {!profile.bio && !(profile.favoriteGenres?.length > 0) && (
              <p
                style={{
                  color: MUTED,
                  fontStyle: "italic",
                  fontSize: 14,
                  marginTop: 0,
                  marginBottom: isOwner ? 16 : 0,
                }}
              >
                {isOwner
                  ? "Add a bio and favorite genres to complete your profile."
                  : "Hasn't shared a bio yet."}
              </p>
            )}

            {isOwner && (
              <button
                className="verba-btn"
                onClick={startEditing}
                style={secondaryBtn}
              >
                Edit profile
              </button>
            )}
          </div>

          <div
            style={{
              marginTop: 22,
              borderTop: `1px solid ${SAGE}55`,
              paddingTop: 20,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: SAGE_DARK,
                letterSpacing: "0.5px",
                marginBottom: 10,
              }}
            >
              REVIEWS
            </div>

          {(!profile.reviews || profile.reviews.length === 0) && (
            <div
              style={{ color: MUTED, fontStyle: "italic", padding: "16px 0" }}
            >
              No reviews yet.
            </div>
          )}

          {profile.reviews?.map((r) => (
            <Link
              key={r.id}
              to={r.bookId ? `/app/reviews/${r.bookId}` : "/app/reviews"}
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                background: PAPER,
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 8,
                }}
              >
                <strong style={{ fontFamily: FONT_SERIF, color: SAGE_DEEP }}>
                  {r.bookTitle}
                </strong>
                <span style={{ color: CLAY, fontSize: 13, flexShrink: 0 }}>
                  {"★".repeat(r.rating)}
                </span>
              </div>
              {r.text && (
                <p
                  style={{ margin: "6px 0 0", color: SAGE_DEEP, fontSize: 14 }}
                >
                  {r.text}
                </p>
              )}
            </Link>
          ))}

          {reviewsTotalPages > 1 && (
            <Pagination
              page={reviewsPage}
              totalPages={reviewsTotalPages}
              goToPage={goToReviewsPage}
            />
          )}
          </div>
          </>
        )}
      </div>

      {profile.linked && editing && (
        <div
          style={{
            background: PAPER,
            borderRadius: 16,
            padding: "22px 24px",
            marginTop: 20,
          }}
        >
          <textarea
            value={draftBio}
            onChange={(e) => setDraftBio(e.target.value.slice(0, 200))}
            maxLength={200}
            rows={4}
            placeholder="A line or two about you…"
            onFocus={(e) => {
              e.target.style.boxShadow = `0 0 0 3px ${SAGE_DARK}33`;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "none";
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginBottom: 6,
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              fontSize: 14,
              lineHeight: 1.5,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontStyle: "italic",
              outline: "none",
              resize: "vertical",
              background: PAPER,
              color: SAGE_DEEP,
              transition: "box-shadow 0.15s ease",
            }}
          />
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>
            {draftBio.length}/200
          </div>

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: SAGE_DARK,
              letterSpacing: "0.5px",
              marginBottom: 4,
            }}
          >
            FAVORITE GENRES
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>
            {draftGenres.length}/{MAX_GENRES} selected
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 22,
            }}
          >
            {genres.map((g) => {
              const selected = draftGenres.includes(g);
              const disabled = !selected && draftGenres.length >= MAX_GENRES;
              return (
                <button
                  key={g}
                  className="verba-btn"
                  onClick={() => toggleGenre(g)}
                  disabled={disabled}
                  style={{
                    borderRadius: 20,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    border: `1.5px solid ${SAGE_DARK}`,
                    background: selected ? SAGE_DEEP : "transparent",
                    color: selected ? PAPER : SAGE_DEEP,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="verba-btn"
              onClick={save}
              disabled={saving}
              style={{ ...primaryBtn, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              className="verba-btn"
              onClick={() => setEditing(false)}
              style={secondaryBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
