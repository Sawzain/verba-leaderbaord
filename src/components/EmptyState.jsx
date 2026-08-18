import { MUTED } from "../theme";
import LeafMark from "./LeafMark";

export default function EmptyState({ message, padding = 40 }) {
  return (
    <div
      style={{
        padding,
        textAlign: "center",
        color: MUTED,
      }}
    >
      <div style={{ opacity: 0.5, marginBottom: 10 }}>
        <LeafMark size={28} color={MUTED} />
      </div>
      <div
        style={{
          fontStyle: "italic",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {message}
      </div>
    </div>
  );
}
