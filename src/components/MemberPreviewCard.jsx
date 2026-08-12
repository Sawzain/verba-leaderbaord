import { Link } from "react-router-dom";
import { OLIVE, OLIVE_DARK, CREAM, CREAM_DARK, WHITE } from "../theme";

const AVATAR_COLORS = [OLIVE, OLIVE_DARK, "#8a9a4a", "#8a6a3a", "#5a7a6a"];
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

// Small floating tooltip-style preview, positioned by the caller (absolute
// inside a relative-positioned wrapper around the triggering name).
// Formats a Date/ISO string as "Jan 2025" — enough to feel personal
// without needing exact-day precision for a small popup.
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
        background: WHITE,
        border: `2px solid ${OLIVE}`,
        borderRadius: 14,
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        padding: "14px 16px",
        width: 230,
        fontFamily: "'Georgia', serif",
      }}
    >
      {loading || !profile ? (
        <div style={{ fontSize: 13, color: "#aaa", fontStyle: "italic" }}>
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
                  color: CREAM,
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
                  fontSize: 14,
                  fontWeight: "bold",
                  color: "#2d2d2d",
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
                  color: "#8a8a72",
                  textDecoration: "underline",
                }}
              >
                {profile.points} book{profile.points !== 1 ? "s" : ""}
              </Link>
              {formatMemberSince(profile.memberSince) && (
                <div style={{ fontSize: 10.5, color: "#aaa", marginTop: 1 }}>
                  Member since {formatMemberSince(profile.memberSince)}
                </div>
              )}
            </div>
          </div>

          {profile.bio && (
            <div
              style={{
                fontSize: 12.5,
                color: "#5a5a4a",
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
                    background: OLIVE,
                    color: CREAM,
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
                    background: CREAM_DARK,
                    color: OLIVE_DARK,
                    borderRadius: 20,
                    padding: "2px 8px",
                    fontSize: 10.5,
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
