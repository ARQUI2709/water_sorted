// ============================================
// HOME SCREEN — title, stats, navigation
// ============================================

function HomeScreen({
  show, level, totalStars, streak, difficulty,
  onPlay, onOpenMap, onOpenSettings, onOpenAchievements,
}) {
  if (!show) return null;

  const diffColor = difficulty === 'easy' ? '#4ade80'
                  : difficulty === 'hard' ? '#f87171'
                  : '#facc15';

  const navButtons = [
    { icon: '🗺', label: 'MAP',      fn: onOpenMap },
    { icon: '🏆', label: 'AWARDS',   fn: onOpenAchievements },
    { icon: '⚙',  label: 'SETTINGS', fn: onOpenSettings },
  ];

  // Bottle icon dimensions (decorative)
  const bw = 80;
  const bh = Math.round(bw * 2.8);
  const liqTop = Math.round(bh * 0.22);
  const liqH = Math.round(bh * 0.73);
  const liqPadX = Math.round(bw * 0.9);
  const sliceH = Math.round(liqH / 4);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between select-none"
      style={{
        zIndex: 40,
        background: "linear-gradient(160deg, #0f0c29, #302b63 50%, #24243e)",
        paddingTop: "max(24px, env(safe-area-inset-top, 24px))",
        paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))",
      }}
    >
      <Stars />

      {/* Decorative blurs */}
      <div className="fixed pointer-events-none" style={{
        width: 160, height: 160, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)",
        top: "8%", right: "-6%", filter: "blur(40px)", zIndex: 0,
      }} />
      <div className="fixed pointer-events-none" style={{
        width: 120, height: 120, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)",
        bottom: "12%", left: "-5%", filter: "blur(30px)", zIndex: 0,
      }} />

      {/* Top spacer */}
      <div className="flex-1" />

      {/* Animated bottle */}
      <div className="relative" style={{
        width: bw,
        height: bh,
        animation: "float 3s ease-in-out infinite",
        marginBottom: 20,
      }}>
        <div className="absolute overflow-hidden" style={{
          width: liqPadX,
          left: liqPadX,
          transform: "translateX(-99%)",
          top: liqTop,
          height: liqH,
          borderRadius: `0 0 ${Math.round(bw * 0.1)}px ${Math.round(bw * 0.1)}px`,
        }}>
          <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse">
            {[MAIN_COLORS[2], MAIN_COLORS[1], MAIN_COLORS[0], MAIN_COLORS[0]].map((color, i) => (
              <div key={i} className="relative" style={{ height: sliceH, backgroundColor: color }}>
                {i === 3 && (
                  <div className="absolute top-0 left-0 right-0" style={{
                    height: 3,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.3) 70%, transparent)",
                    animation: "wave 3s ease-in-out infinite",
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
        <img
          src="assets/bottle.png"
          alt=""
          draggable={false}
          className="absolute inset-0 pointer-events-none"
          style={{ width: bw, height: bh, objectFit: "fill" }}
        />
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: FONTS.orbitron,
        fontWeight: 900,
        fontSize: "2.2rem",
        background: "linear-gradient(135deg, #fff, #c084fc, #818cf8)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "0.15em",
        lineHeight: 1.1,
        animation: "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}>
        WATER SORT
      </h1>

      <div style={{
        fontFamily: FONTS.default,
        fontSize: "0.9rem",
        color: "rgba(255,255,255,0.35)",
        letterSpacing: "0.3em",
        marginTop: -2,
        fontWeight: 600,
      }}>
        PUZZLE
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mt-5">
        <div className="px-3 py-1.5 rounded-full" style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}>
          <span style={{
            fontFamily: FONTS.orbitron,
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "rgba(255,255,255,0.8)",
          }}>
            LEVEL {level}
          </span>
        </div>

        {totalStars > 0 && (
          <div className="px-3 py-1.5 rounded-full" style={{
            background: "rgba(251,191,36,0.1)",
            border: "1px solid rgba(251,191,36,0.2)",
          }}>
            <span style={{
              fontFamily: FONTS.default,
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#fbbf24",
            }}>
              ★ {totalStars}
            </span>
          </div>
        )}

        {streak > 0 && (
          <div className="px-3 py-1.5 rounded-full" style={{
            background: "rgba(255,100,0,0.12)",
            border: "1px solid rgba(255,100,0,0.18)",
          }}>
            <span style={{
              fontFamily: FONTS.default,
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#FF6B35",
            }}>
              🔥 {streak}
            </span>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Play button */}
      <button
        onClick={onPlay}
        className="active:scale-95"
        style={{
          width: 240,
          padding: "16px 0",
          borderRadius: 16,
          fontFamily: FONTS.orbitron,
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "0.15em",
          background: "linear-gradient(135deg, #8b5cf6, #6366f1, #8b5cf6)",
          backgroundSize: "200% auto",
          boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
          border: "none",
          cursor: "pointer",
          minHeight: 56,
          animation: "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s both, shimmer 3s linear 0.8s infinite",
        }}
      >
        {level > 1 ? "CONTINUE" : "PLAY"}
      </button>

      {/* Difficulty label */}
      <div style={{
        fontFamily: FONTS.default,
        fontSize: "0.7rem",
        fontWeight: 700,
        color: diffColor,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginTop: 8,
        opacity: 0.8,
      }}>
        {difficulty}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom nav */}
      <div className="flex items-center gap-5">
        {navButtons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.fn}
            className="flex flex-col items-center justify-center active:scale-90"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
          >
            <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>
              {btn.icon}
            </span>
            <span style={{
              fontSize: "0.5rem",
              color: "rgba(255,255,255,0.45)",
              fontFamily: FONTS.default,
              fontWeight: 700,
              marginTop: 2,
              letterSpacing: "0.03em",
            }}>
              {btn.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
