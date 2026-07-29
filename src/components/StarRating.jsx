// Clickable stars for submitting a review.
export function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <span style={{ fontSize: 26 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="verba-clickable"
          style={{
            cursor: "pointer",
            color: n <= active ? "#c9a227" : CREAM_DARK,
            transition: "color 0.1s",
          }}
        >
          ★
        </span>
      ))}
      <span
        style={{
          marginLeft: 8,
          fontSize: 13,
          color: OLIVE_DARK,
          verticalAlign: "middle",
        }}
      >
        {value ? `${value}/5` : "Tap to rate"}
      </span>
    </span>
  );
}
