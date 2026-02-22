// ============================================
// WIN SCREEN — victory overlay with stats
// ============================================

function WinScreen({ show, stars, moves, mopt, time, streak, onNext }) {
  if (!show) return null;

  const stats = [
    { value: moves, label: "moves", color: null },
    mopt > 0 ? { value: mopt, label: "optimal", color: "#a78bfa" } : null,
    { value: time, label: "time", color: null },
    streak > 1 ? { value: `🔥${streak}`, label: "streak", color: "#FF6B35" } : null,
  ].filter(Boolean);

  return (
    <>
      <Confetti />
      <div className="fixed inset-0 flex items-center justify-center px-6" style={{
        zIndex: 50, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)",
      }}>
        <div className="text-center p-6 rounded-3xl w-full max-w-xs" style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          animation: "bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 6, animation: "float 2s ease-in-out infinite" }}>
            🎉
          </div>

          <h2 className="font-black tracking-wider mb-2" style={{
            fontFamily: FONTS.orbitron,
            fontSize: "1.2rem",
            background: "linear-gradient(135deg,#fbbf24,#f59e0b,#fbbf24)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 2s linear infinite",
          }}>
            COMPLETE!
          </h2>

          {stars > 0 && (
            <div className="flex justify-center gap-1 mb-2" style={{ fontSize: "1.6rem" }}>
              {[1, 2, 3].map(i => (
                <span key={i} style={{
                  color: i <= stars ? "#fbbf24" : "rgba(255,255,255,0.15)",
                  textShadow: i <= stars ? "0 0 8px rgba(251,191,36,0.5)" : "none",
                  transition: "all 0.3s ease",
                  animationDelay: `${i * 0.15}s`,
                }}>
                  ★
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-4 mb-4" style={{ fontFamily: FONTS.default }}>
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div style={{ fontSize: "1.3rem", color: stat.color || undefined }}
                  className={`font-bold ${!stat.color ? "text-purple-200" : ""}`}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onNext}
            className="w-full py-3 rounded-2xl font-bold text-white active:scale-95"
            style={{
              fontFamily: FONTS.orbitron,
              fontSize: "0.85rem",
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              boxShadow: "0 4px 16px rgba(139,92,246,0.35)",
              letterSpacing: "0.1em",
              minHeight: 48,
            }}
          >
            NEXT LEVEL →
          </button>
        </div>
      </div>
    </>
  );
}
