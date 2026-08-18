import { SAGE } from "../theme";

export default function LeafMark({ size = 16, color = SAGE }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <path
        d="M20 4C10 10 6 20 12 32c2-6 6-11 12-14-4 6-6 12-6 18 10-4 16-14 14-26-4 2-8 3-12 3 2-3 4-6 0-9z"
        fill={color}
      />
    </svg>
  );
}
