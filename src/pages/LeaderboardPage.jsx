import { useOutletContext } from "react-router-dom";
import LeaderboardView from "../components/LeaderboardView";

export default function LeaderboardPage() {
  const { membersState, activityState, quotesState } = useOutletContext();
  const { sorted, members, loading } = membersState;

  return (
    <LeaderboardView
      sorted={sorted}
      memberCount={members.length}
      loading={loading}
      activity={activityState.activity}
      totalBooksRead={activityState.booksRead}
      totalQuotes={quotesState.total}
    />
  );
}
