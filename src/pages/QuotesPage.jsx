import { useOutletContext } from "react-router-dom";
import QuoteWallView from "../components/QuoteWallView";
import TwoColumnLayout from "../components/TwoColumnLayout";
import ReaderIndexPreview from "../components/ReaderIndexPreview";
import CurrentPickPreview from "../components/CurrentPickPreview";
import RecentActivityPreview from "../components/RecentActivityPreview";

export default function QuotesPage() {
  const {
    auth,
    isAdmin,
    quotesState,
    membersState,
    booksState,
    activityState,
  } = useOutletContext();

  const handleToggleFavorite = (quoteId, nextValue) =>
    quotesState.toggleFavorite(auth.token, quoteId, nextValue);

  const handleDeleteQuote = async (quoteId) => {
    try {
      await quotesState.deleteQuote(auth.token, quoteId);
    } catch (err) {
      window.alert(err.message || "Couldn't delete that quote.");
    }
  };

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
          favoriteOnly={quotesState.favoriteOnly}
          setFavoriteOnly={quotesState.setFavoriteOnly}
          search={quotesState.search}
          setSearch={quotesState.setSearch}
          sort={quotesState.sort}
          setSort={quotesState.setSort}
          isAdmin={isAdmin}
          onToggleFavorite={handleToggleFavorite}
          onDeleteQuote={handleDeleteQuote}
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
