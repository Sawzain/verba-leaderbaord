import { Link } from "react-router-dom";
import useBooks from "../hooks/useBooks";
import useMembers from "../hooks/useMembers";
import { Skeleton } from "../components/Skeleton";
import { useAuthContext } from "../AuthContext";
import { StarDisplay } from "../components/StarRating";
import { resolveCoverUrl } from "../utils/resolveCoverUrl";
import Footer, { DISCORD_INVITE_URL } from "../components/Footer";
import Header from "../components/Header";
import AccountChip from "../components/AccountChip";
import {
  SAGE_DARK,
  SAGE_DEEP,
  MUTED,
  PAPER,
  SAGE,
  FONT_SERIF,
  FONT_SANS,
} from "../theme";


const TOPBAR_MAX_WIDTH = 1400;
const CONTENT_MAX_WIDTH = 760;

const sectionHeading = {
  fontSize: 13,
  color: SAGE_DEEP,
  letterSpacing: "2px",
  textTransform: "uppercase",
  marginBottom: 10,
  fontWeight: "bold",
};

const sectionStyle = {
  padding: "clamp(16px, 4vw, 28px) clamp(16px, 5vw, 32px)",
  borderBottom: "1px solid rgba(45,51,39,0.08)",
};

const ctaButtonStyle = {
  display: "inline-block",
  background: SAGE_DARK,
  color: PAPER,
  border: "none",
  borderRadius: 12,
  padding: "14px 28px",
  fontSize: 16,
  fontFamily: FONT_SERIF,
  textDecoration: "none",
  cursor: "pointer",
  boxShadow: "0 8px 30px rgba(45, 60, 45, 0.08)",
};

export default function LandingPage() {
  const { books, loading, error } = useBooks();
  const currentPick = books.find((b) => b.isCurrentPick);

  // Mirrors AppShell's myMemberId resolution — AccountChip's "View
  // Profile" link needs the Score document's _id, not the logged-in
  // User's own id, so it has to be cross-referenced against the member
  // list. Without this, the landing page's account menu silently omits
  // the link (myMemberId defaults to null in AccountChip).
  const auth = useAuthContext();
  const membersState = useMembers(null, true);
  const myMemberId = auth.isLoggedIn
    ? membersState.members.find((m) => m.userId === auth.user?.id)?._id || null
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: FONT_SANS,
        background: SAGE,
        width: "100%",
      }}
    >
      <div
        style={{
          background: PAPER,
          borderBottom: "1px solid rgba(45,51,39,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          className="verba-topbar"
          style={{
            maxWidth: TOPBAR_MAX_WIDTH,
            margin: "0 auto",
            padding: "14px clamp(16px, 4vw, 32px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <Header />
          <AccountChip myMemberId={myMemberId} />
        </div>
      </div>

      <div
        className="verba-content-wrap"
        style={{
          maxWidth: CONTENT_MAX_WIDTH,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          padding: "24px clamp(12px, 4vw, 24px)",
        }}
      >
        <div
          style={{
            width: "100%",
            background: PAPER,
            border: "1px solid rgba(45,51,39,0.08)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {/* Hero */}
          <div
            style={{ ...sectionStyle, paddingBottom: "clamp(8px, 2vw, 16px)" }}
          >
            <div
              style={{
                fontSize: "clamp(24px, 6vw, 30px)",
                fontWeight: "bold",
                color: SAGE_DEEP,
                fontFamily: FONT_SERIF,
                marginBottom: 4,
              }}
            >
              Verba Book Club
            </div>
            <div
              style={{
                fontSize: 14,
                color: SAGE_DEEP,
                letterSpacing: "0.5px",
                fontStyle: "italic",
                fontFamily: FONT_SERIF,
                marginBottom: 18,
              }}
            >
              verba — words that stay
            </div>

            <p
              style={{
                fontSize: 15,
                color: SAGE_DEEP,
                lineHeight: 1.7,
                marginBottom: 12,
                marginTop: 0,
              }}
            >
              Verba is Latin for <em>words</em> — the words we read, the words
              we share, the words that quietly change us. It's also the
              Ukrainian word for <em>willow</em>: a tree that bends in the storm
              but never breaks, always reaching toward water and depth.
            </p>
            <p
              style={{
                fontSize: 15,
                color: SAGE_DEEP,
                lineHeight: 1.7,
                margin: "0 0 18px",
              }}
            >
              That's the space we're building here — somewhere to show up
              exactly as you are, on the hard days and the easy ones. No
              pressure, no judgement. Just words, stories, and the people who
              love them.
            </p>
          </div>

          {/* How it works / how to join */}
          <div style={sectionStyle}>
            <div style={sectionHeading}>How it works</div>
            <p
              style={{
                fontSize: 15,
                color: SAGE_DEEP,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              We meet every Saturday at 3pm GMT on Google Meet to talk through
              our current pick, then choose the next one and read it together
              over the following month. Everyone's progress lands on a shared
              leaderboard, and reviews stay up so you can revisit what the group
              thought long after we've moved on. New members are always welcome
              — join our Discord to stay in the loop between calls.
            </p>

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
                background: `${SAGE}66`,
                color: SAGE_DEEP,
                border: `1px solid ${SAGE_DEEP}`,
                borderRadius: 10,
                padding: "10px 19px",
                fontSize: 14,
                fontWeight: "bold",
                fontFamily: FONT_SERIF,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(45, 60, 45, 0.06)",
              }}
            >
              Join us on Discord
            </a>
          </div>
          {/* Current pick — folded into the main flow as social proof,
              rather than a sidebar widget (this page is a pitch to people
              who aren't members yet, not a utility page for existing
              members, so it reads better as part of the story than as a
              small aside). */}
          <div style={sectionStyle}>
            <div style={sectionHeading}>Current pick</div>
            {loading && (
              <div style={{ display: "flex", gap: 16 }}>
                <Skeleton width={72} height={96} borderRadius={8} />
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    paddingTop: 2,
                  }}
                >
                  <Skeleton width="60%" height={17} />
                  <Skeleton width="35%" height={13} />
                  <Skeleton width="45%" height={12} />
                </div>
              </div>
            )}
            {!loading && error && (
              <div style={{ color: MUTED, fontStyle: "italic", fontSize: 14 }}>
                Couldn't load the current pick — try refreshing.
              </div>
            )}
            {!loading && !error && !currentPick && (
              <div style={{ color: MUTED, fontStyle: "italic", fontSize: 14 }}>
                {books.length === 0
                  ? "Nothing on the shelf yet — check back soon."
                  : "No current pick chosen yet — check back soon."}
              </div>
            )}
            {!loading && currentPick && (
              <Link
                to={`/app/reviews/${currentPick._id}`}
                className="verba-btn"
                style={{
                  display: "flex",
                  gap: 16,
                  textDecoration: "none",
                  color: "inherit",
                  background: `${SAGE}66`,
                  border: `1px solid ${SAGE}`,
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
                    background: `${MUTED}33`,
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
                      color: SAGE_DEEP,
                    }}
                  >
                    {currentPick.title}
                  </div>
                  {currentPick.author && (
                    <div
                      style={{ fontSize: 13, color: SAGE_DEEP, marginTop: 2 }}
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
                        <span style={{ fontSize: 12, color: SAGE_DARK }}>
                          {currentPick.avgRating} · {currentPick.reviewCount}{" "}
                          review
                          {currentPick.reviewCount !== 1 ? "s" : ""}
                        </span>
                      </>
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                          color: MUTED,
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

          <div
            style={{
              ...sectionStyle,
              borderBottom: "none",
              textAlign: "center",
            }}
          >
            <Link
              to="/app/leaderboard"
              className="verba-btn verba-btn-elevated"
              style={ctaButtonStyle}
            >
              Enter the club →
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
