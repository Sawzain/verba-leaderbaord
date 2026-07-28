import { OLIVE_DARK } from "../theme";

export default function AccountBar({ auth }) {
  if (!auth.isLoggedIn) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
        background: "#eef3e2",
        border: "1px solid #d3e0bd",
        borderRadius: 10,
        padding: "8px 12px",
      }}
    >
      <span style={{ fontSize: 13, color: "#3f4d1e" }}>
        Logged in as <strong>{auth.user?.name}</strong>
      </span>
      <button
        onClick={auth.logout}
        style={{
          background: "transparent",
          border: "none",
          color: OLIVE_DARK,
          fontSize: 12,
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        Log out
      </button>
    </div>
  );
}
