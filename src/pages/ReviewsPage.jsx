import { useOutletContext, useParams } from "react-router-dom";
import BooksView from "../components/BooksView";
import TwoColumnLayout from "../components/TwoColumnLayout";
import VerbaWallPreview from "../components/VerbaWallPreview";
import ReaderIndexPreview from "../components/ReaderIndexPreview";
import RecentActivityPreview from "../components/RecentActivityPreview";

export default function ReviewsPage() {
  const {
    auth,
    isAdmin,
    booksState,
    quotesState,
    membersState,
    activityState,
  } = useOutletContext();
  const { bookId } = useParams();

  const featuredQuote =
    quotesState.quotes.find((q) => q.featured) || quotesState.quotes[0];

  return (
    <TwoColumnLayout
      main={
        <BooksView
          initialBookId={bookId}
          books={booksState.books}
          loading={booksState.loading}
          error={booksState.error}
          page={booksState.page}
          totalPages={booksState.totalPages}
          goToPage={booksState.goToPage}
          isAdminUnlocked={isAdmin}
          adminKey={auth.token}
          addBook={booksState.addBook}
          editBook={booksState.editBook}
          removeBook={booksState.removeBook}
          setCurrentPick={booksState.setCurrentPick}
          fetchBook={booksState.fetchBook}
          addReview={booksState.addReview}
          removeReview={booksState.removeReview}
          removeMyReview={booksState.removeMyReview}
          editReview={booksState.editReview}
          auth={auth}
        />
      }
      sidebar={
        <>
          <ReaderIndexPreview
            sorted={membersState.sorted}
            memberCount={membersState.members.length}
          />
          <VerbaWallPreview quote={featuredQuote} />
          <RecentActivityPreview
            activity={activityState.activity}
            quotes={quotesState.quotes}
          />
        </>
      }
    />
  );
}
