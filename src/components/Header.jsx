import { Link } from "react-router-dom";
import { SAGE_DEEP, MUTED, FONT_SERIF, FONT_MONO } from "../theme";
import VerbaLogo from "./VerbaLogo";

export default function Header() {
  return (
    <Link
      to="/"
      aria-label="Back to Verba Book Club home"
      className="verba-header-link"
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        textDecoration: "none",
      }}
    >
      <VerbaLogo height={40} color={SAGE_DEEP} className="verba-logo-mark" />
      <span
        className="verba-header-subtitle"
        style={{
          fontFamily: FONT_MONO,
          fontSize: 7, // was 10.5
          lineHeight: 2.5, // add this
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
