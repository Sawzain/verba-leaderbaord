import { SAGE_DARK, SAGE_TINT, MUTED } from "../theme";

// Base shimmering placeholder box. Built from SAGE_DARK at low, staggered
// opacity stops so it reads as a lighter/darker sweep against PAPER
// without introducing a new color into the theme.
export function Skeleton({ width, height, borderRadius = 6, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(90deg, ${SAGE_DARK}22 25%, ${SAGE_DARK}3d 37%, ${SAGE_DARK}22 63%)`,
        backgroundSize: "400% 100%",
        animation: "verba-shimmer 1.4s ease infinite",
        ...style,
      }}
    />
  );
}

// Mirrors the real leaderboard row in LeaderboardView.jsx — same flex
// layout, gap, and padding — so the swap-in on load doesn't jump.
export function SkeletonMemberRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        borderRadius: 10,
        borderBottom: "1px solid rgba(45,51,39,0.07)",
      }}
    >
      <Skeleton width={24} height={13} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Skeleton width="55%" height={17} />
      </div>
      <Skeleton width={70} height={27} borderRadius={7} />
    </div>
  );
}

// Mirrors the real BookCard.jsx shell — same SAGE_TINT fill, MUTED
// border, 3:4 cover block, and padded text stack below it.
export function SkeletonBookCard() {
  return (
    <div
      style={{
        background: SAGE_TINT,
        border: `1px solid ${MUTED}`,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ width: "100%", aspectRatio: "3 / 4" }}>
        <Skeleton width="100%" height="100%" borderRadius={0} />
      </div>
      <div
        style={{
          padding: "14px 14px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Skeleton width="80%" height={17} />
        <Skeleton width="55%" height={14} />
        <div style={{ marginTop: "auto", paddingTop: 10 }}>
          <Skeleton width="40%" height={15} />
        </div>
      </div>
    </div>
  );
}
