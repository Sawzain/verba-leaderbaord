import { Link } from "react-router-dom";
import { SAGE_DEEP, MUTED, FONT_SERIF, FONT_MONO } from "../theme";

export default function Header() {
  return (
    <Link
      to="/"
      aria-label="Back to Verba Book Club home"
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        textDecoration: "none",
      }}
    >
      <span
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 26,
          color: SAGE_DEEP,
        }}
      >
        verba.
      </span>
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10.5,
          letterSpacing: "1.5px",
          color: MUTED,
          textTransform: "uppercase",
        }}
      >
        Words that stay
      </span>
    </Link>
  );
}
