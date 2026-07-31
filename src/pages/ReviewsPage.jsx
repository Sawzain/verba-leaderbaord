import { useOutletContext } from "react-router-dom";
import BooksView from "../components/BooksView";

export default function ReviewsPage() {
  const { auth, isAdmin, booksState } = useOutletContext();
  return (
    <BooksView
      books={booksState.books}
      loading={booksState.loading}
      error={booksState.error}
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
