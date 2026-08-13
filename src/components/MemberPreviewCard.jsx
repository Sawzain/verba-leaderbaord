import { Link } from "react-router-dom";
import {
  SAGE_DEEP,
  SAGE_DARK,
  PAPER,
  MUTED,
  CLAY,
  SAGE_TINT,
  CLAY_TINT,
  AVATAR_COLORS,
  FONT_SERIF,
  FONT_SANS,
} from "../theme";

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

function formatMemberSince(dateValue) {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (isNaN(d)) return null;
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

const MAX_VISIBLE_GENRES = 4;

export default function MemberPreviewCard({ profile, loading }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        zIndex: 50,
        background: PAPER,
        borderRadius: 14,
        boxShadow: "0 10px 30px rgba(45,51,39,0.18)",
        padding: "14px 16px",
        width: 230,
        fontFamily: FONT_SANS,
      }}
    >
      {loading || !profile ? (
        <div style={{ fontSize: 13, color: MUTED, fontStyle: "italic" }}>
          Loading…
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: avatarColor(profile.name),
                  color: PAPER,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: "bold",
                  flexShrink: 0,
                }}
              >
                {initials(profile.name)}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 15,
                  fontFamily: FONT_SERIF,
                  fontWeight: 600,
                  color: SAGE_DEEP,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {profile.name}
              </div>
              <Link
                to={`/app/members/${profile.id}`}
                style={{
                  fontSize: 12,
                  color: SAGE_DARK,
                  textDecoration: "underline",
                }}
              >
                {profile.points} book{profile.points !== 1 ? "s" : ""}
              </Link>
              {formatMemberSince(profile.memberSince) && (
                <div style={{ fontSize: 10.5, color: MUTED, marginTop: 1 }}>
                  Member since {formatMemberSince(profile.memberSince)}
                </div>
              )}
            </div>
          </div>

          {profile.bio && (
            <div
              style={{
                fontSize: 12.5,
                color: SAGE_DEEP,
                marginTop: 10,
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {profile.bio}
            </div>
          )}

          {profile.favoriteGenres?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginTop: 10,
              }}
            >
              {profile.favoriteGenres.slice(0, MAX_VISIBLE_GENRES).map((g) => (
                <span
                  key={g}
                  style={{
                    background: SAGE_TINT,
                    color: SAGE_DEEP,
                    borderRadius: 20,
                    padding: "2px 8px",
                    fontSize: 10.5,
                  }}
                >
                  {g}
                </span>
              ))}
              {profile.favoriteGenres.length > MAX_VISIBLE_GENRES && (
                <span
                  style={{
                    background: CLAY_TINT,
                    color: CLAY,
                    borderRadius: 20,
                    padding: "2px 8px",
                    fontSize: 10.5,
                    fontWeight: 600,
                  }}
                >
                  +{profile.favoriteGenres.length - MAX_VISIBLE_GENRES}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}