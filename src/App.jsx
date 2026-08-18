import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AppShell from "./AppShell";
import useAuth from "./hooks/useAuth";
import { AuthContext } from "./AuthContext";
import useUIFeedback from "./hooks/useUIFeedback";
import { UIFeedbackContext } from "./UIFeedbackContext";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";
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
const MemberProfilePage = lazy(() => import("./pages/MemberProfilePage"));

export default function App() {
  const auth = useAuth();
  const uiFeedback = useUIFeedback();

  return (
    <AuthContext.Provider value={auth}>
      <UIFeedbackContext.Provider value={uiFeedback}>
        <style>{buttonInteractionStyles}</style>
        <ConfirmDialog />
        <Toast />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/app" element={<AppShell />}>
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="members/:id" element={<MemberProfilePage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="reviews/:bookId" element={<ReviewsPage />} />
              <Route path="quotes" element={<QuotesPage />} />
              <Route path="manage" element={<ManagePage />} />
            </Route>
          </Routes>
        </Suspense>
      </UIFeedbackContext.Provider>
    </AuthContext.Provider>
  );
}
