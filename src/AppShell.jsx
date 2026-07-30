import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import TabSwitcher from "./components/TabSwitcher";
import Footer from "./components/Footer";
import useMembers from "./hooks/useMembers";
import useBooks from "./hooks/useBooks";
import { useAuthContext } from "./AuthContext";
import { CREAM } from "./theme";

// Owns auth/members/books state and lifts it to routed views via
// <Outlet context={...}>, so switching tabs doesn't lose session state
// or refetch already-loaded data.
export default function AppShell() {
  const auth = useAuthContext();
  const isAdmin = auth.isLoggedIn && Boolean(auth.user?.isAdmin);
  const location = useLocation();

  // Only fetch what the active tab needs; each hook caches once loaded.
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