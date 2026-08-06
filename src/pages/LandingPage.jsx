import { Link } from "react-router-dom";
import useBooks from "../hooks/useBooks";
import { StarDisplay } from "../components/StarRating";
import { resolveCoverUrl } from "../utils/resolveCoverUrl";
import Footer, { DISCORD_INVITE_URL } from "../components/Footer";
import {
  OLIVE,
  OLIVE_DARK,
  OLIVE_LIGHT,
  CREAM,
  CREAM_DARK,
  LOGO_SRC,
} from "../theme";
import { buttonInteractionStyles } from "../styles/buttonInteractions";

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
  boxShadow: "0 8px 30px rgba(45, 60, 45, 0.08)",
};

// Inline style objects can't express :hover/:active, so interactive buttons
// get a matching CSS class (defined in the <style> block below) alongside
// their inline styles. The class only carries hover/active/transition
// rules — colors and one-off layout stay in the inline style, so this is
// additive rather than a second source of truth.
export default function LandingPage() {
  const { books, loading } = useBooks();
  const currentPick = books.find((b) => b.isCurrentPick);

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
          fetchPriority="high"
          decoding="async"
          style={{
            width: 140,
            height: 140,
            objectFit: "cover",
            borderRadius: 16,
            display: "block",
            margin: "0 auto 20px",
            // Updated shadow to the softer, modern float
            boxShadow: "0 8px 30px rgba(45, 60, 45, 0.08)",
          }}
        />
        <div
          style={{
            fontSize: 34,
            fontWeight: "bold",
            color: OLIVE_DARK,
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

        {/* Broken up text into two paragraphs for better readability */}
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              fontSize: 16,
              color: OLIVE_DARK,
              lineHeight: 1.7,
              marginBottom: 12,
              marginTop: 0,
            }}
          >
            Verba is Latin for <em>words</em> — the words we read, the words we
            share, the words that quietly change us. It's also the Ukrainian
            word for <em>willow</em>: a tree that bends in the storm but never
            breaks, always reaching toward water and depth.
          </p>
          <p
            style={{
              fontSize: 16,
              color: OLIVE_DARK,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            That's the space we're building here — somewhere to show up exactly
            as you are, on the hard days and the easy ones. No pressure, no
            judgement. Just words, stories, and the people who love them.
          </p>
        </div>

        <Link
          to="/app/leaderboard"
          className="verba-btn verba-btn-elevated"
          style={ctaButtonStyle}
        >
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
          // Softened the card shadow to match the overall modern aesthetic
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08)",
          marginBottom: 24,
        }}
      >
        {/* How it works / how to join */}
        <div
          style={{
            padding: "28px 32px",
            borderBottom: `1px solid ${CREAM_DARK}`,
          }}
        >
          <div style={sectionHeading}>How it works</div>
          <p
            style={{
              fontSize: 15,
              color: OLIVE_DARK,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            We meet every Saturday at 3pm GMT on Google Meet to talk through our
            current pick, then choose the next one and read it together over the
            following month. Everyone's progress lands on a shared leaderboard,
            and reviews stay up so you can revisit what the group thought long
            after we've moved on. New members are always welcome — join our
            Discord to stay in the loop between calls.
          </p>

          {/* Changed the Discord button to a subtle outline button */}
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="verba-btn verba-btn-outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
              background: "transparent",
              color: OLIVE_DARK,
              border: `1px solid ${OLIVE_DARK}`,
              borderRadius: 10,
              padding: "9px 17px",
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
            <div
              style={{ color: OLIVE_LIGHT, fontStyle: "italic", fontSize: 14 }}
            >
              Loading…
            </div>
          )}
          {!loading && !currentPick && (
            <div
              style={{ color: OLIVE_LIGHT, fontStyle: "italic", fontSize: 14 }}
            >
              {books.length === 0
                ? "Nothing on the shelf yet — check back soon."
                : "No current pick chosen yet — check back soon."}
            </div>
          )}
          {!loading && currentPick && (
            <Link
              to="/app/reviews"
              className="verba-btn"
              style={{
                display: "flex",
                gap: 16,
                textDecoration: "none",
                color: "inherit",
                background: `${CREAM_DARK}66`,
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
                  background: `${OLIVE_LIGHT}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {currentPick.coverImage ? (
                  <img
                    src={resolveCoverUrl(currentPick.coverImage)}
                    alt={currentPick.title}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 24, opacity: 0.4 }}>📖</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: "bold",
                    color: OLIVE_DARK,
                  }}
                >
                  {currentPick.title}
                </div>
                {currentPick.author && (
                  <div
                    style={{ fontSize: 13, color: OLIVE_DARK, marginTop: 2 }}
                  >
                    {currentPick.author}
                  </div>
                )}
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {currentPick.avgRating ? (
                    <>
                      <StarDisplay value={currentPick.avgRating} size={13} />
                      <span style={{ fontSize: 12, color: OLIVE }}>
                        {currentPick.avgRating} · {currentPick.reviewCount}{" "}
                        review
                        {currentPick.reviewCount !== 1 ? "s" : ""}
                      </span>
                    </>
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        color: OLIVE_LIGHT,
                        fontStyle: "italic",
                      }}
                    >
                      No reviews yet — be the first
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
