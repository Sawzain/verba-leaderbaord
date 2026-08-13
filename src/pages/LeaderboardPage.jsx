import { useOutletContext } from "react-router-dom";
import LeaderboardView from "../components/LeaderboardView";
import TwoColumnLayout from "../components/TwoColumnLayout";
import VerbaWallPreview from "../components/VerbaWallPreview";
import CurrentPickPreview from "../components/CurrentPickPreview";
import RecentActivityPreview from "../components/RecentActivityPreview";

export default function LeaderboardPage() {
  const { membersState, activityState, quotesState, booksState } =
    useOutletContext();
  const { sorted, members, loading } = membersState;

  const featuredQuote =
    quotesState.quotes.find((q) => q.featured) || quotesState.quotes[0];

  return (
    <TwoColumnLayout
      main={
        <LeaderboardView
          sorted={sorted}
          memberCount={members.length}
          loading={loading}
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
          <RecentActivityPreview activity={activityState.activity} quotes={quotesState.quotes} />
          <VerbaWallPreview quote={featuredQuote} />
        </>
      }
    />
  );
}
