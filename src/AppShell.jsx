import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import TabSwitcher from "./components/TabSwitcher";
import Footer from "./components/Footer";
import useMembers from "./hooks/useMembers";
import useBooks from "./hooks/useBooks";
import useAuth from "./hooks/useAuth";
import { CREAM } from "./theme";

// Shell for everything under /app/*. Owns all the state that used to live
// directly in VerbaLeaderboard.jsx (auth, members, books) and lifts it above
// the routed views via <Outlet context={...}>, so switching between
// /app/leaderboard, /app/reviews and /app/manage doesn't lose session state
// or refetch data that's already loaded.
export default function AppShell() {
  const auth = useAuth();
  const isAdmin = auth.isLoggedIn && Boolean(auth.user?.isAdmin);
  const booksState = useBooks();
  const membersState = useMembers(auth.token);

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
