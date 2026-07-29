import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import TabSwitcher from "./components/TabSwitcher";
import Footer from "./components/Footer";
import useMembers from "./hooks/useMembers";
import useBooks from "./hooks/useBooks";
import { useAuthContext } from "./AuthContext";
import { CREAM } from "./theme";

// Shell for everything under /app/*. Owns all the state that used to live
// directly in VerbaLeaderboard.jsx (auth, members, books) and lifts it above
// the routed views via <Outlet context={...}>, so switching between
// /app/leaderboard, /app/reviews and /app/manage doesn't lose session state
// or refetch data that's already loaded.
export default function AppShell() {
  const auth = useAuthContext();
  const isAdmin = auth.isLoggedIn && Boolean(auth.user?.isAdmin);
  const location = useLocation();

  // Only fetch what the active tab actually needs, instead of fetching
  // books AND members on every /app/* mount regardless of which tab is
  // open. Each hook caches once loaded, so flipping tabs back and forth
  // doesn't refetch.
  const needsBooks = location.pathname.startsWith("/app/reviews");
  const needsMembers =
    location.pathname.startsWith("/app/leaderboard") ||
    location.pathname.startsWith("/app/manage");

  const booksState = useBooks(needsBooks);
  const membersState = useMembers(auth.token, needsMembers);

  const context = { auth, isAdmin, booksState, membersState };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'Georgia', serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 16px",
      }}
    >
      <Header />
      <TabSwitcher />

      <div
        style={{
          width: "100%",
          maxWidth: 620,
          background: CREAM,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
        }}
      >
        <Outlet context={context} />
      </div>

      <Footer maxWidth={620} />
    </div>
  );
}