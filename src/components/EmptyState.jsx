import { OLIVE_LIGHT } from "../theme";

// Shared "nothing to show" message — used for loading states, empty lists,
// and no-search-results messages across Books, Leaderboard, and Reviews.
export default function EmptyState({ message, padding = 40 }) {
  return (
    <div
      style={{
        padding,
        textAlign: "center",
        color: OLIVE_LIGHT,
        fontStyle: "italic",
      }}
    >
      {message}
    </div>
  );
}
