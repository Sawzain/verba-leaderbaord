import { useOutletContext, useParams } from "react-router-dom";
import BooksView from "../components/BooksView";

export default function ReviewsPage() {
  const { auth, isAdmin, booksState } = useOutletContext();
  const { bookId } = useParams();
  return (
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
  );
}