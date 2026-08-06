import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AppShell from "./AppShell";
import useAuth from "./hooks/useAuth";
import { AuthContext } from "./AuthContext";
import { buttonInteractionStyles } from "./styles/buttonInteractions";

// Route-level code splitting: each page only downloads its JS when the
// user actually navigates there, instead of all pages bundling into the
// initial load. LandingPage stays eager since it's almost always the first
// thing loaded (direct visits, marketing links, etc.) — no benefit to
// lazy-loading the very first screen someone sees.
import LandingPage from "./pages/LandingPage";
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const ManagePage = lazy(() => import("./pages/ManagePage"));
const QuotesPage = lazy(() => import("./pages/QuotesPage"));

export default function App() {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      <style>{buttonInteractionStyles}</style>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/app" element={<AppShell />}>
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="quotes" element={<QuotesPage />} />
            <Route path="manage" element={<ManagePage />} />
          </Route>
        </Routes>
      </Suspense>
    </AuthContext.Provider>
  );
}
