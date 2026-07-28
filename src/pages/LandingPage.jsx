import { Link } from "react-router-dom";
import useBooks from "../hooks/useBooks";
import { StarDisplay } from "../components/StarRating";
import { resolveCoverUrl } from "../utils/resolveCoverUrl";
import {
  OLIVE,
  OLIVE_DARK,
  OLIVE_LIGHT,
  CREAM,
  CREAM_DARK,
  WHITE,
  LOGO_SRC,
} from "../theme";

const DISCORD_INVITE_URL = "https://discord.gg/7a2H9bcXZ2";
const INSTAGRAM_URL = "https://www.instagram.com/bookclub_verba";

const sectionHeading = {
  fontSize: 13,
  color: OLIVE_DARK,
  letterSpacing: "2px",
  textTransform: "uppercase",
  marginBottom: 10,
  fontWeight: "bold",
};

const ctaButtonStyle = {
  display: "inline-block",
  background: OLIVE,
  color: CREAM,
  border: "none",
  borderRadius: 12,
  padding: "14px 28px",
  fontSize: 16,
  fontFamily: "'Georgia', serif",
  textDecoration: "none",
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
};

export default function LandingPage() {
  // The landing page only needs the book list for the "current pick" teaser,
  // so it fetches independently rather than through AppShell's shared state
  // (this page renders outside /app and shouldn't force that state to load
  // for visitors who never go past "/").
  const { books, loading } = useBooks();
  const currentPick = books[0]; // API returns books sorted newest first

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'Georgia', serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 20px 24px",
      }}
    >
      {/* Hero */}
      <div style={{ textAlign: "center", maxWidth: 640, marginBottom: 40 }}>
        <img
          src={LOGO_SRC}
          alt="Verba Book Club"
          style={{
            width: 140,
            height: 140,
            objectFit: "cover",
            borderRadius: 16,
            display: "block",
            margin: "0 auto 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        />
        <div
          style={{
            fontSize: 34,
            fontWeight: "bold",
            color: "#2d2d2d",
            marginBottom: 6,
          }}
        >
          Verba Book Club
        </div>
        <div
          style={{
            fontSize: 15,
            color: OLIVE_DARK,
            letterSpacing: "1px",
            fontStyle: "italic",
            marginBottom: 20,
          }}
        >
          verba — words that stay
        </div>
        <p
          style={{
            fontSize: 16,
            color: "#3f4230",
            lineHeight: 1.7,
            marginBottom: 28,
          }}
        >
          A small reading community that tracks what we finish, argues about
          it, and hands out points for showing up. Pick a book, read on your
          own schedule, and leave a rating and review when you're done —
          everyone's progress lands on one shared leaderboard.
        </p>
        <Link to="/app/leaderboard" style={ctaButtonStyle}>
          Enter the club →
        </Link>
      </div>

      {/* Main content card */}
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          background: CREAM,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          marginBottom: 24,
        }}
      >
        {/* How it works / how to join */}
        <div style={{ padding: "28px 32px", borderBottom: `1px solid ${CREAM_DARK}` }}>
          <div style={sectionHeading}>How it works</div>
          <p style={{ fontSize: 15, color: "#3f4230", lineHeight: 1.7, margin: 0 }}>
            We read at our own pace and check in together on Discord — no
            fixed weekly deadline, just a shared shelf and a running
            scoreboard. New members are always welcome.
          </p>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
              background: "#5865F2",
              color: "#fff",
              borderRadius: 10,
              padding: "10px 18px",
              fontSize: 14,
              fontFamily: "'Georgia', serif",
              textDecoration: "none",
            }}
          >
            Join us on Discord
          </a>
        </div>

        {/* Book of the month teaser */}
        <div style={{ padding: "28px 32px" }}>
          <div style={sectionHeading}>Current pick</div>
          {loading && (
            <div style={{ color: "#aaa", fontStyle: "italic", fontSize: 14 }}>
              Loading…
            </div>
          )}
          {!loading && !currentPick && (
            <div style={{ color: "#aaa", fontStyle: "italic", fontSize: 14 }}>
              Nothing on the shelf yet — check back soon.
            </div>
          )}
          {!loading && currentPick && (
            <Link
              to="/app/reviews"
              style={{
                display: "flex",
                gap: 16,
                textDecoration: "none",
                color: "inherit",
                background: WHITE,
                border: `1px solid ${CREAM_DARK}`,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 96,
                  flexShrink: 0,
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "#e4ddc7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {currentPick.coverImage ? (
                  <img
                    src={resolveCoverUrl(currentPick.coverImage)}
                    alt={currentPick.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: 24, opacity: 0.4 }}>📖</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: "bold", color: "#2d2d2d" }}>
                  {currentPick.title}
                </div>
                {currentPick.author && (
                  <div style={{ fontSize: 13, color: OLIVE_DARK, marginTop: 2 }}>
                    {currentPick.author}
                  </div>
                )}
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  {currentPick.avgRating ? (
                    <>
                      <StarDisplay value={currentPick.avgRating} size={13} />
                      <span style={{ fontSize: 12, color: "#888" }}>
                        {currentPick.avgRating} · {currentPick.reviewCount} review
                        {currentPick.reviewCount !== 1 ? "s" : ""}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: "#aaa", fontStyle: "italic" }}>
                      No reviews yet — be the first
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          textAlign: "center",
          padding: "20px 16px 0",
          borderTop: `1px solid ${OLIVE_LIGHT}55`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 10 }}>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            style={{ color: OLIVE_DARK, fontSize: 13, textDecoration: "none" }}
          >
            Discord
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            style={{ color: OLIVE_DARK, fontSize: 13, textDecoration: "none" }}
          >
            Instagram
          </a>
        </div>
        <div style={{ fontSize: 12, color: OLIVE_DARK, opacity: 0.85 }}>
          Verba Book Club © {new Date().getFullYear()} · Est. 2025
        </div>
      </div>
    </div>
  );
}
