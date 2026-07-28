import { useOutletContext } from "react-router-dom";
import LeaderboardView from "../components/LeaderboardView";

export default function LeaderboardPage() {
  const { membersState } = useOutletContext();
  const { sorted, members, loading } = membersState;
  return (
    <LeaderboardView sorted={sorted} memberCount={members.length} loading={loading} />
  );
}
