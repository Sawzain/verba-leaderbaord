import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import TabSwitcher from "./components/TabSwitcher";
import Footer from "./components/Footer";
import useMembers from "./hooks/useMembers";
import useBooks from "./hooks/useBooks";
import useQuotes from "./hooks/useQuotes";
import { useAuthContext } from "./AuthContext";

// Owns auth/members/books state and lifts it to routed views via
// <Outlet context={...}>, so switching tabs doesn't lose session state.
// Both books and members load in parallel on mount rather than waiting
// for their matching tab to be active — so switching tabs feels instant
// instead of triggering a fresh fetch (and its full network latency)
// the first time you land on each one.
export default function AppShell() {
  const auth = useAuthContext();
  const isAdmin = auth.isLoggedIn && Boolean(auth.user?.isAdmin);

  const booksState = useBooks(true);
  const membersState = useMembers(auth.token, true);
  const quotesState = useQuotes(true);

  const context = { auth, isAdmin, booksState, membersState, quotesState };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'Georgia', serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 16px",
        overflowX: "hidden",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Header />
      <div style={{ width: "100%", maxWidth: 620 }}>
        <TabSwitcher />
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 620,
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

      <Footer maxWidth={620} />
    </div>
  );
}
