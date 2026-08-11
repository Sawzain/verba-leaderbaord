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
export default function MemberPreviewCard({ profile, loading }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: `1px solid ${CREAM_DARK}`,
        borderRadius: 14,
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        padding: "14px 16px",
        width: 200,
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
            </div>
          </div>

          {profile.favoriteGenres?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginTop: 10,
              }}
            >
              {profile.favoriteGenres.slice(0, 2).map((g) => (
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
