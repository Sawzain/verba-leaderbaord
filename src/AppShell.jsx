import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import TabSwitcher from "./components/TabSwitcher";
import AccountChip from "./components/AccountChip";
import Footer from "./components/Footer";
import useMembers from "./hooks/useMembers";
import useBooks from "./hooks/useBooks";
import useQuotes from "./hooks/useQuotes";
import { useAuthContext } from "./AuthContext";
import useUnlinkedUsers from "./hooks/useUnlinkedUsers";
import useActivity from "./hooks/useActivity";
import { SAGE, PAPER, FONT_SERIF } from "./theme";

// Reviews, Leaderboard, and Quotes (Verba Wall) share the wide two-column
// layout (see TwoColumnLayout) — everything else sits in a narrower single
// column. Add a base path here for any future page that needs the wide
// treatment.
const WIDE_LAYOUT_ROUTES = ["/app/reviews", "/app/leaderboard", "/app/quotes"];
const DEFAULT_CONTENT_MAX_WIDTH = 900;
const WIDE_CONTENT_MAX_WIDTH = 1400;

function isWideLayoutRoute(pathname) {
  return WIDE_LAYOUT_ROUTES.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  );
}

export default function AppShell() {
  const auth = useAuthContext();
  const location = useLocation();
  const isAdmin = auth.isLoggedIn && Boolean(auth.user?.isAdmin);
  const isWide = isWideLayoutRoute(location.pathname);
  const contentMaxWidth = isWide
    ? WIDE_CONTENT_MAX_WIDTH
    : DEFAULT_CONTENT_MAX_WIDTH;

  const booksState = useBooks(true);
  const membersState = useMembers(auth.token, true);
  const myMemberId = auth.isLoggedIn
    ? membersState.members.find((m) => m.userId === auth.user?.id)?._id || null
    : null;
  const quotesState = useQuotes(true);
  const unlinkedUsersState = useUnlinkedUsers(auth.token, isAdmin);
  const activityState = useActivity(true);

  const context = {
    auth,
    isAdmin,
    booksState,
    membersState,
    quotesState,
    unlinkedUsersState,
    activityState,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: FONT_SERIF,
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
            maxWidth: WIDE_CONTENT_MAX_WIDTH,
            margin: "0 auto",
            padding: "14px clamp(16px, 4vw, 32px)",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 24,
          }}
        >
          <Header />
          <div
            className="verba-tabs-account-row"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              flexWrap: "wrap",
              minWidth: 0,
            }}
          >
            <TabSwitcher isAdmin={isAdmin} />
          </div>
          <AccountChip myMemberId={myMemberId} />
        </div>
      </div>

      <div
        className="verba-content-wrap"
        style={{
          maxWidth: contentMaxWidth,
          margin: "0 auto",
          padding: "24px clamp(12px, 4vw, 24px)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div key={location.pathname} className="verba-fade-in">
          <Outlet context={context} />
        </div>
      </div>

      <Footer maxWidth={contentMaxWidth} />
    </div>
  );
}
