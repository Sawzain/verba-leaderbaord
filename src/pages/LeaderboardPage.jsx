import { useOutletContext } from "react-router-dom";
import LeaderboardView from "../components/LeaderboardView";
import TwoColumnLayout from "../components/TwoColumnLayout";
import VerbaWallPreview from "../components/VerbaWallPreview";
import CurrentPickPreview from "../components/CurrentPickPreview";
import RecentActivityPreview from "../components/RecentActivityPreview";
import useLeaderboard from "../hooks/useLeaderboard";

export default function LeaderboardPage() {
  const { activityState, quotesState, booksState } = useOutletContext();
  const leaderboard = useLeaderboard(true);

  return (
    <TwoColumnLayout
      main={
        <LeaderboardView
          members={leaderboard.members}
          total={leaderboard.total}
          page={leaderboard.page}
          totalPages={leaderboard.totalPages}
          goToPage={leaderboard.goToPage}
          loading={leaderboard.loading}
          totalBooksRead={activityState.booksRead}
          totalQuotes={quotesState.total}
        />
      }
      sidebar={
        <>
          <CurrentPickPreview
            books={booksState.books}
            loading={booksState.loading}
          />
          <RecentActivityPreview
            activity={activityState.activity}
            quotes={quotesState.quotes}
          />
          <VerbaWallPreview quotes={quotesState.quotes} />
        </>
      }
    />
  );
}
