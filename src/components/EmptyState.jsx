import { MUTED } from "../theme";

export default function EmptyState({ message, padding = 40 }) {
  return (
    <div
      style={{
        padding,
        textAlign: "center",
        color: MUTED,
        fontStyle: "italic",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {message}
    </div>
  );
}