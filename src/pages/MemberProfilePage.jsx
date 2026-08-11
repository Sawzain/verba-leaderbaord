import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthContext } from "../AuthContext";
import useMemberProfile from "../hooks/useMemberProfile";
import { OLIVE, OLIVE_DARK, CREAM, CREAM_DARK } from "../theme";

export default function MemberProfilePage() {
  const { id } = useParams();
  const { user, token } = useAuthContext();
  const { profile, genres, loading, error, saving, updateProfile } =
    useMemberProfile(id, token);
  const [editing, setEditing] = useState(false);
  const [draftBio, setDraftBio] = useState("");
  const [draftGenres, setDraftGenres] = useState([]);

  if (loading)
    return <div style={{ padding: 40, textAlign: "center" }}>Loading…</div>;
  if (error || !profile)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
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
    setDraftGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <Link to="/app/leaderboard" style={{ color: OLIVE_DARK, fontSize: 13 }}>
        ← Back to leaderboard
      </Link>

      <h1
        style={{
          fontFamily: "'Georgia', serif",
          color: OLIVE_DARK,
          marginTop: 12,
        }}
      >
        {profile.name}
      </h1>
      <div style={{ color: "#8a8a72", marginBottom: 20 }}>
        {profile.points} book{profile.points !== 1 ? "s" : ""} read
      </div>

      {!profile.linked && (
        <div
          style={{
            background: CREAM,
            border: `1px solid ${CREAM_DARK}`,
            borderRadius: 12,
            padding: 16,
            color: OLIVE_DARK,
            fontStyle: "italic",
          }}
        >
          Link your Discord account to unlock your full profile — bio, favorite
          genres, and reviews will show up here once connected.
        </div>
      )}

      {profile.linked && !editing && (
        <>
          {profile.bio && <p style={{ color: "#3f4230" }}>{profile.bio}</p>}
          {profile.favoriteGenres?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 16,
              }}
            >
              {profile.favoriteGenres.map((g) => (
                <span
                  key={g}
                  style={{
                    background: OLIVE,
                    color: CREAM,
                    borderRadius: 20,
                    padding: "3px 10px",
                    fontSize: 12,
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {isOwner && (
            <button onClick={startEditing} style={{ marginBottom: 20 }}>
              Edit profile
            </button>
          )}

          <h3 style={{ color: OLIVE_DARK, fontFamily: "'Georgia', serif" }}>
            Reviews
          </h3>
          {(!profile.reviews || profile.reviews.length === 0) && (
            <div style={{ color: "#aaa", fontStyle: "italic" }}>
              No reviews yet.
            </div>
          )}
          {profile.reviews?.map((r) => (
            <div
              key={r.id}
              style={{
                padding: "10px 0",
                borderBottom: `1px solid ${CREAM_DARK}`,
              }}
            >
              <strong>{r.bookTitle}</strong> — {"★".repeat(r.rating)}
              <p style={{ margin: "4px 0 0", color: "#3f4230" }}>{r.text}</p>
            </div>
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
            style={{ width: "100%", boxSizing: "border-box", marginBottom: 8 }}
          />
          <div style={{ fontSize: 12, color: "#8a8a72", marginBottom: 12 }}>
            {draftBio.length}/200
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 16,
            }}
          >
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                style={{
                  borderRadius: 20,
                  padding: "4px 12px",
                  fontSize: 12,
                  border: `1px solid ${OLIVE}`,
                  background: draftGenres.includes(g) ? OLIVE : "transparent",
                  color: draftGenres.includes(g) ? CREAM : OLIVE_DARK,
                  cursor: "pointer",
                }}
              >
                {g}
              </button>
            ))}
          </div>
          <button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={() => setEditing(false)} style={{ marginLeft: 8 }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
