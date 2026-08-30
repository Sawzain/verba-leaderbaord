import { SAGE_DARK, SAGE_TINT, MUTED, SAGE } from "../theme";

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

// Mirrors the real quote/poem card in QuoteWallView.jsx — same
// CARD_BG/CARD_BORDER shell and padding, with shimmering lines standing
// in for wrapped quote text plus a meta row (name · book / "View →").
export function SkeletonQuoteCard({ featured = false }) {
  return (
    <div
      style={{
        border: `1px solid ${SAGE}`,
        background: featured ? MUTED : `${SAGE}66`,
        borderRadius: 10,
        padding: featured ? "18px 20px" : "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Skeleton width="95%" height={15} />
        <Skeleton width="88%" height={15} />
        <Skeleton width="55%" height={15} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Skeleton width="35%" height={12} />
        <Skeleton width={50} height={12} />
      </div>
    </div>
  );
}

// Mirrors the real MemberRow.jsx layout in ManageView — name bar on the
// left, the −/points-pill/+/trash cluster on the right, same sizes as
// the live buttons so the swap-in doesn't jump.
export function SkeletonManageRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 0",
        borderBottom: `1px solid ${SAGE_TINT}`,
      }}
    >
      <div style={{ flex: 1 }}>
        <Skeleton width="40%" height={16} />
      </div>
      <Skeleton width={34} height={34} borderRadius="50%" />
      <Skeleton width={68} height={28} borderRadius={8} />
      <Skeleton width={34} height={34} borderRadius="50%" />
      <Skeleton width={16} height={16} />
    </div>
  );
}
