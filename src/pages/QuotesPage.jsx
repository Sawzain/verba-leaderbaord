import { useOutletContext } from "react-router-dom";
import QuoteWallView from "../components/QuoteWallView";

export default function QuotesPage() {
  const { quotesState } = useOutletContext();
  return (
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
  );
}
