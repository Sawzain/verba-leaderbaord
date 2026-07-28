import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AppShell from "./AppShell";
import LeaderboardPage from "./pages/LeaderboardPage";
import ReviewsPage from "./pages/ReviewsPage";
import ManagePage from "./pages/ManagePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppShell />}>
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="manage" element={<ManagePage />} />
      </Route>
    </Routes>
  );
}
