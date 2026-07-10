import { OLIVE_DARK, CREAM, CREAM_DARK } from "../theme";

export default function TabSwitcher({ tab, setTab }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 24,
        background: OLIVE_DARK,
        padding: "4px",
        borderRadius: 12,
      }}
    >
      {["board", "manage"].map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          style={{
            padding: "8px 24px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontFamily: "'Georgia', serif",
            background: tab === t ? CREAM : "transparent",
            color: tab === t ? OLIVE_DARK : CREAM_DARK,
            fontWeight: tab === t ? "bold" : "normal",
            transition: "all 0.2s",
          }}
        >
          {t === "board" ? "Leaderboard" : "Manage"}
        </button>
      ))}
    </div>
  );
}
