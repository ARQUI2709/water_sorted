// ============================================
// HEADER — top bar with level info + controls
// ============================================

function Header({
  level, moves, bestStars, best, streak,
  difficulty, hiddenCount, time,
  doneCount, numColors,
  onOpenMap, onOpenSettings,
}) {
  const diffColor = difficulty === 'easy' ? '#4ade80' : difficulty === 'hard' ? '#f87171' : '#facc15';
  const hiddenLabel = hiddenCount === 0 ? null : hiddenCount >= 3 ? "TOP" : `H${hiddenCount}`;

  return (
    <div className="w-full px-3 pt-2 pb-1 shrink-0" style={{ position: "relative", zIndex: 20 }}>
      <div className="flex items-center justify-between max-w-3xl mx-auto">

        {/* Left: level info badges */}
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <button
            onClick={onOpenMap}
            className="font-black active:scale-95"
            style={{
              fontFamily: FONTS.orbitron, fontSize: "1.1rem",
              background: "linear-gradient(135deg,#fff,#c084fc,#818cf8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}
          >
            LV{level}
          </button>

          <span className="px-2 py-0.5 rounded-full" style={{
            background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.75rem",
            fontFamily: FONTS.default, fontWeight: 600,
          }}>
            {moves} mv
          </span>

          {bestStars > 0 && (
            <span className="px-1.5 py-0.5 rounded-full" style={{
              background: "rgba(255,215,0,0.1)", color: "#FFD700",
              border: "1px solid rgba(255,215,0,0.15)", fontSize: "0.7rem",
              fontFamily: FONTS.default,
            }}>
              {"★".repeat(bestStars)}{"☆".repeat(3 - bestStars)}
            </span>
          )}

          {best > 0 && !bestStars && (
            <span className="px-1.5 py-0.5 rounded-full" style={{
              background: "rgba(255,215,0,0.1)", color: "#FFD700",
              border: "1px solid rgba(255,215,0,0.15)", fontSize: "0.7rem",
              fontFamily: FONTS.default,
            }}>
              ★{best}
            </span>
          )}

          {streak > 1 && (
            <span className="px-1.5 py-0.5 rounded-full" style={{
              background: "rgba(255,100,0,0.12)", color: "#FF6B35",
              border: "1px solid rgba(255,100,0,0.18)", fontSize: "0.7rem",
              fontFamily: FONTS.default,
            }}>
              🔥{streak}
            </span>
          )}

          <span className="px-1.5 py-0.5 rounded-full" style={{
            background: `${diffColor}15`,
            color: diffColor,
            border: `1px solid ${diffColor}25`,
            fontSize: "0.65rem",
            fontWeight: 700,
            fontFamily: FONTS.default,
            textTransform: "uppercase",
          }}>
            {difficulty}
          </span>

          {hiddenLabel && (
            <span className="px-1.5 py-0.5 rounded-full" style={{
              background: "rgba(255,0,110,0.15)", color: "#FF006E",
              border: "1px solid rgba(255,0,110,0.2)", fontSize: "0.65rem",
              fontWeight: 700, fontFamily: FONTS.default, animation: "pulse 2s infinite",
            }}>
              🔒{hiddenLabel}
            </span>
          )}
        </div>

        {/* Right: settings gear + timer + progress ring */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenSettings}
            className="active:scale-90"
            style={{
              fontSize: "1.1rem",
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1,
              padding: 4,
            }}
            aria-label="Settings"
          >
            ⚙
          </button>
          <span style={{
            fontFamily: FONTS.orbitron, fontSize: "0.75rem",
            color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em",
          }}>
            {time}
          </span>

          <div className="relative" style={{ width: 32, height: 32 }}>
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
              <circle
                cx="16" cy="16" r="13" fill="none" stroke="#8b5cf6" strokeWidth="2.5"
                strokeDasharray={`${(doneCount / Math.max(1, numColors)) * 81.7} 81.7`}
                strokeLinecap="round" transform="rotate(-90 16 16)"
                style={{ transition: "stroke-dasharray 0.4s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center" style={{
              fontSize: "0.65rem", fontWeight: 700,
              color: "rgba(255,255,255,0.55)", fontFamily: FONTS.default,
            }}>
              {doneCount}/{numColors}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
