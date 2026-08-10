import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import TabSwitcher from "./components/TabSwitcher";
import Footer from "./components/Footer";
import useMembers from "./hooks/useMembers";
import useBooks from "./hooks/useBooks";
import useQuotes from "./hooks/useQuotes";
import { useAuthContext } from "./AuthContext";
import useUnlinkedUsers from "./hooks/useUnlinkedUsers";
import useActivity from "./hooks/useActivity";

// Owns auth/members/books state and lifts it to routed views via
// <Outlet context={...}>, so switching tabs doesn't lose session state.
// Both books and members load in parallel on mount rather than waiting
// for their matching tab to be active — so switching tabs feels instant
// instead of triggering a fresh fetch (and its full network latency)
// the first time you land on each one.
//
// Panel width: fixed at 620px through 1080p (clamp floor), then scales
// fluidly with viewport width above that, capped at 900px on very wide
// screens. Inline styles can't do media queries, but clamp() gives the
// same effect without needing an injected <style> block.
const PANEL_MAX_WIDTH = "clamp(620px, 32vw, 820px)";

export default function AppShell() {
  const auth = useAuthContext();
  const isAdmin = auth.isLoggedIn && Boolean(auth.user?.isAdmin);

  const booksState = useBooks(true);
  const membersState = useMembers(auth.token, true);
  const quotesState = useQuotes(true);
  const unlinkedUsersState = useUnlinkedUsers(auth.token, isAdmin);
  const activityState = useActivity(true);

 const context = { auth, isAdmin, booksState, membersState, quotesState, unlinkedUsersState, activityState };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'Georgia', serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 24px",
        overflowX: "hidden",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Header />
      <div
        style={{
          width: "100%",
          maxWidth: PANEL_MAX_WIDTH,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <TabSwitcher />
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: PANEL_MAX_WIDTH,
          background: "rgba(238,232,213,0.82)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
        }}
      >
        <Outlet context={context} />
      </div>

      <Footer maxWidth={PANEL_MAX_WIDTH} />
    </div>
  );
}
