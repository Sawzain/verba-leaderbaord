import { useOutletContext } from "react-router-dom";
import QuoteWallView from "../components/QuoteWallView";
import TwoColumnLayout from "../components/TwoColumnLayout";
import ReaderIndexPreview from "../components/ReaderIndexPreview";
import CurrentPickPreview from "../components/CurrentPickPreview";
import RecentActivityPreview from "../components/RecentActivityPreview";

export default function QuotesPage() {
  const { quotesState, membersState, booksState, activityState } =
    useOutletContext();

  return (
    <TwoColumnLayout
      main={
        <QuoteWallView
          quotes={quotesState.quotes}
          loading={quotesState.loading}
          error={quotesState.error}
          bookFilter={quotesState.bookFilter}
          setBookFilter={quotesState.setBookFilter}
          sourceFilter={quotesState.sourceFilter}
          setSourceFilter={quotesState.setSourceFilter}
          page={quotesState.page}
          totalPages={quotesState.totalPages}
          goToPage={quotesState.goToPage}
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
          <ReaderIndexPreview
            sorted={membersState.sorted}
            memberCount={membersState.members.length}
          />
        </>
      }
    />
  );
}
