import { useOutletContext } from "react-router-dom";
import LeaderboardView from "../components/LeaderboardView";

export default function LeaderboardPage() {
  const { membersState, activityState, quotesState } = useOutletContext();
  const { sorted, members, loading } = membersState;

  const totalBooksRead = members.reduce((sum, m) => sum + (m.points || 0), 0);

  return (
    <LeaderboardView
      sorted={sorted}
      memberCount={members.length}
      loading={loading}
      activity={activityState.activity}
      totalBooksRead={totalBooksRead}
      totalQuotes={quotesState.total}
    />
  );
}
