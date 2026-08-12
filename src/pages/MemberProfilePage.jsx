import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthContext } from "../AuthContext";
import useMemberProfile from "../hooks/useMemberProfile";
import {
  OLIVE,
  OLIVE_DARK,
  OLIVE_LIGHT,
  CREAM,
  CREAM_DARK,
  WHITE,
} from "../theme";

// Same deterministic initials-avatar approach used nowhere else yet in the
// app, but matches the palette — a stable color per name (via a simple
// hash) so the same person always gets the same avatar color.
const AVATAR_COLORS = [OLIVE, OLIVE_DARK, OLIVE_LIGHT, "#8a6a3a", "#5a7a6a"];
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const primaryBtn = {
  background: OLIVE,
  color: CREAM,
  border: "none",
  borderRadius: 10,
  padding: "8px 18px",
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "'Georgia', serif",
};

const secondaryBtn = {
  background: "transparent",
  color: OLIVE_DARK,
  border: `1.5px solid ${CREAM_DARK}`,
  borderRadius: 10,
  padding: "8px 18px",
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "'Georgia', serif",
};

export default function MemberProfilePage() {
  const { id } = useParams();
  const { user, token } = useAuthContext();
  const { profile, genres, loading, error, saving, updateProfile } =
    useMemberProfile(id, token);
  const [editing, setEditing] = useState(false);
  const [draftBio, setDraftBio] = useState("");
  const [draftGenres, setDraftGenres] = useState([]);
  const [booksExpanded, setBooksExpanded] = useState(false);

  if (loading)
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#aaa",
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
          color: "#aaa",
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

  const MAX_GENRES = 5;

  const toggleGenre = (g) =>
    setDraftGenres((prev) => {
      if (prev.includes(g)) return prev.filter((x) => x !== g);
      if (prev.length >= MAX_GENRES) return prev;
      return [...prev, g];
    });

  return (
    <div style={{ padding: "24px" }}>
      <Link
        to="/app/leaderboard"
        style={{
          color: OLIVE_DARK,
          fontSize: 13,
          textDecoration: "underline",
        }}
      >
        ← Back to leaderboard
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          margin: "18px 0 20px",
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
              color: CREAM,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: "bold",
              fontFamily: "'Georgia', serif",
              flexShrink: 0,
            }}
          >
            {initials(profile.name)}
          </div>
        )}
        <div>
          <h1
            style={{
              fontFamily: "'Georgia', serif",
              color: OLIVE_DARK,
              margin: 0,
              fontSize: 24,
            }}
          >
            {profile.name}
          </h1>
          <div style={{ color: "#8a8a72", fontSize: 13, marginTop: 2 }}>
            {profile.points} book{profile.points !== 1 ? "s" : ""} read
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          color: OLIVE,
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Books Read
      </div>

      {(!profile.booksRead || profile.booksRead.length === 0) && (
        <div
          style={{
            color: "#aaa",
            fontStyle: "italic",
            fontSize: 14,
            marginBottom: 22,
          }}
        >
          No books read yet.
        </div>
      )}

      {profile.booksRead?.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {(booksExpanded
              ? profile.booksRead
              : profile.booksRead.slice(0, 3)
            ).map((title, i, arr) => (
              <li
                key={`${title}-${i}`}
                style={{
                  padding: "9px 4px",
                  borderBottom:
                    i < arr.length - 1 ? `1px solid ${CREAM_DARK}` : "none",
                  color: "#3f4230",
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
                color: OLIVE_DARK,
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
            background: CREAM,
            border: `1px solid ${CREAM_DARK}`,
            borderRadius: 12,
            padding: "14px 16px",
            color: OLIVE_DARK,
            fontStyle: "italic",
            fontSize: 14,
          }}
        >
          Link your Discord account to unlock your full profile — bio, favorite
          genres, and reviews will show up here once connected.
        </div>
      )}

      {profile.linked && !editing && (
        <>
          {profile.bio && (
            <p
              style={{
                color: "#3f4230",
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
                marginBottom: 18,
              }}
            >
              {profile.favoriteGenres.map((g) => (
                <span
                  key={g}
                  style={{
                    background: OLIVE,
                    color: CREAM,
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontFamily: "'Georgia', serif",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {isOwner && (
            <button
              className="verba-btn"
              onClick={startEditing}
              style={{ ...secondaryBtn, marginBottom: 22 }}
            >
              Edit profile
            </button>
          )}

          <div
            style={{
              fontSize: 13,
              color: OLIVE,
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Reviews
          </div>

          {(!profile.reviews || profile.reviews.length === 0) && (
            <div
              style={{
                color: "#aaa",
                fontStyle: "italic",
                padding: "16px 0",
              }}
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
                background: WHITE,
                border: `1px solid ${CREAM_DARK}`,
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
                <strong
                  style={{ fontFamily: "'Georgia', serif", color: "#2d2d2d" }}
                >
                  {r.bookTitle}
                </strong>
                <span style={{ color: "#d4a017", fontSize: 13, flexShrink: 0 }}>
                  {"★".repeat(r.rating)}
                </span>
              </div>
              {r.text && (
                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#3f4230",
                    fontSize: 14,
                  }}
                >
                  {r.text}
                </p>
              )}
            </Link>
          ))}
        </>
      )}

      {profile.linked && editing && (
        <div>
          <textarea
            value={draftBio}
            onChange={(e) => setDraftBio(e.target.value.slice(0, 200))}
            maxLength={200}
            rows={4}
            placeholder="A line or two about you…"
            onFocus={(e) => {
              e.target.style.borderColor = OLIVE;
              e.target.style.boxShadow = `0 0 0 3px ${OLIVE}22`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = CREAM_DARK;
              e.target.style.boxShadow = "none";
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginBottom: 6,
              padding: "12px 16px",
              borderRadius: 12,
              border: `1.5px solid ${CREAM_DARK}`,
              fontSize: 14,
              lineHeight: 1.5,
              fontFamily: "'Georgia', serif",
              fontStyle: "italic",
              outline: "none",
              resize: "vertical",
              background: WHITE,
              color: "#2d2d2d",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            }}
          />
          <div style={{ fontSize: 12, color: "#8a8a72", marginBottom: 14 }}>
            {draftBio.length}/200
          </div>

          <div
            style={{
              fontSize: 13,
              color: OLIVE_DARK,
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Favorite genres
          </div>
          <div style={{ fontSize: 12, color: "#8a8a72", marginBottom: 10 }}>
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
                    fontFamily: "'Georgia', serif",
                    border: `1.5px solid ${OLIVE}`,
                    background: selected ? OLIVE : "transparent",
                    color: selected ? CREAM : OLIVE_DARK,
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
