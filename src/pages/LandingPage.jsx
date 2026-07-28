export default function LandingPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px 20px" }}>
      {/* Left-Aligned Header & Intro Block */}
      <div style={{ textAlign: "left", marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "serif",
            color: OLIVE_DARK,
            fontSize: 32,
            marginBottom: 12,
          }}
        >
          Verba Book Club
        </h1>
        <p
          style={{
            fontSize: 15,
            color: OLIVE_DARK,
            opacity: 0.9,
            lineHeight: 1.5,
            marginBottom: 12,
          }}
        >
          A quiet corner for thoughtful readers. Discover our next read, join
          the discussion, and connect with fellow book lovers.
        </p>
        <p
          style={{
            fontSize: 14,
            color: OLIVE_DARK,
            opacity: 0.8,
            lineHeight: 1.5,
          }}
        >
          We pick a new book each month ranging across fiction, philosophy, and
          essays, anchored by a shared appreciation for deep reading.
        </p>
      </div>

      {/* Optional Feature / Action Container */}
      <div
        style={{
          textAlign: "left",
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(45, 60, 45, 0.08)",
          marginBottom: 32,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontFamily: "serif",
            color: OLIVE_DARK,
            marginBottom: 8,
          }}
        >
          Current Read & Pacing
        </h2>
        <p
          style={{
            fontSize: 14,
            color: OLIVE_DARK,
            opacity: 0.85,
            lineHeight: 1.6,
          }}
        >
          Whether you read a chapter a day or rush through it on the final
          weekend, all pacing styles are welcome here.
        </p>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
