import { useState } from "react";
import { MUTED, SAGE_DEEP } from "../theme";

// Clickable stars for submitting a review.
export function StarInput({ value, onChange, size = 26 }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <span style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="verba-clickable"
          style={{
            cursor: "pointer",
            color: n <= active ? "#c9a227" : MUTED,
            transition: "color 0.1s",
          }}
        >
          ★
        </span>
      ))}
      <span
        style={{
          marginLeft: 8,
          fontSize: Math.round(size * 0.5),
          color: SAGE_DEEP,
          verticalAlign: "middle",
        }}
      >
        {value ? `${value}/5` : "Tap to rate"}
      </span>
    </span>
  );
}

// Read-only stars for displaying an existing rating.
export function StarDisplay({ value, size = 16 }) {
  return (
    <span style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            color: n <= value ? "#c9a227" : MUTED,
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}
