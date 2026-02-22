// ============================================
// BOTTOM CONTROLS — action button bar (footer)
// ============================================

function BottomControls({ controls }) {
  return (
    <div className="shrink-0 px-2 pb-1.5" style={{
      position: "relative", zIndex: 20,
      paddingBottom: "max(6px, env(safe-area-inset-bottom, 6px))",
    }}>
      <div className="flex justify-center gap-1.5 max-w-md mx-auto">
        {controls.map((btn, i) => (
          <button
            key={i}
            onClick={btn.fn}
            disabled={btn.dis}
            className="flex-1 flex flex-col items-center justify-center rounded-xl active:scale-90 disabled:opacity-25"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              minHeight: 48,
              maxWidth: 64,
              transition: "transform 0.1s",
            }}
          >
            <span style={{ fontSize: "1.1rem", lineHeight: 1, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>
              {btn.icon}
            </span>
            <span style={{
              fontSize: "0.55rem", color: "rgba(255,255,255,0.45)",
              fontFamily: FONTS.default, fontWeight: 700, marginTop: 2, letterSpacing: "0.03em",
            }}>
              {btn.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
