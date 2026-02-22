// ============================================
// LEVEL MAP — visual level selector with path
// ============================================

function LevelMap({ show, onClose, currentLevel, onSelectLevel }) {
  const scrollRef = React.useRef(null);
  const currentRef = React.useRef(null);

  const totalLevels = Math.max(20, currentLevel + 5);
  const nodeSpacing = 90;
  const amplitude = 80;
  const svgWidth = 300;
  const svgPadTop = 60;
  const svgPadBot = 40;
  const totalHeight = totalLevels * nodeSpacing + svgPadTop + svgPadBot;
  const cx = svgWidth / 2;

  const nodes = React.useMemo(() => {
    const arr = [];
    for (let n = 1; n <= totalLevels; n++) {
      const y = totalHeight - svgPadBot - ((n - 1) * nodeSpacing) - 24;
      const x = cx + amplitude * Math.sin(n * 0.8);
      const s = getBestStars(n);
      arr.push({ n, x, y, stars: s });
    }
    return arr;
  }, [totalLevels, totalHeight]);

  const pathD = React.useMemo(() => {
    if (!nodes.length) return "";
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      const cpY = (prev.y + curr.y) / 2;
      d += ` Q ${prev.x} ${cpY}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [nodes]);

  React.useEffect(() => {
    if (show && currentRef.current && scrollRef.current) {
      setTimeout(() => {
        currentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        zIndex: 70,
        background: "linear-gradient(160deg, rgba(15,12,41,0.97), rgba(48,43,99,0.97) 50%, rgba(36,36,62,0.97))",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top, 12px))" }}
      >
        <h2 className="font-bold" style={{
          fontFamily: FONTS.orbitron, fontSize: "1rem",
          background: "linear-gradient(135deg,#fff,#c084fc,#818cf8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          LEVEL MAP
        </h2>
        <button
          onClick={onClose}
          className="active:scale-90"
          style={{
            fontSize: "1.4rem", color: "rgba(255,255,255,0.5)",
            lineHeight: 1, padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Scrollable map */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="relative mx-auto" style={{ width: svgWidth, height: totalHeight }}>
          {/* SVG path */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={svgWidth} height={totalHeight}
            style={{ overflow: "visible" }}
          >
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="3"
              strokeDasharray="8 6"
              strokeLinecap="round"
            />
            {(() => {
              const activePath = nodes.slice(0, currentLevel);
              if (activePath.length < 2) return null;
              let d = `M ${activePath[0].x} ${activePath[0].y}`;
              for (let i = 1; i < activePath.length; i++) {
                const prev = activePath[i - 1];
                const curr = activePath[i];
                const cpY = (prev.y + curr.y) / 2;
                d += ` Q ${prev.x} ${cpY}, ${curr.x} ${curr.y}`;
              }
              return (
                <path
                  d={d}
                  fill="none"
                  stroke="rgba(139,92,246,0.3)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })()}
          </svg>

          {/* Level nodes */}
          {nodes.map(({ n, x, y, stars: s }) => {
            const isCurrent = n === currentLevel;
            const isCompleted = n < currentLevel || s > 0;
            const isLocked = n > currentLevel;
            const canTap = !isLocked;
            const nodeSize = isCurrent ? 52 : 44;

            return (
              <div
                key={n}
                ref={isCurrent ? currentRef : null}
                onClick={canTap ? () => onSelectLevel(n) : undefined}
                className="absolute flex flex-col items-center"
                style={{
                  left: x - nodeSize / 2,
                  top: y - nodeSize / 2,
                  width: nodeSize,
                  cursor: canTap ? "pointer" : "default",
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: nodeSize,
                    height: nodeSize,
                    background: isLocked
                      ? "rgba(255,255,255,0.04)"
                      : isCompleted && s > 0
                        ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                        : isCompleted
                          ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                          : "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.3))",
                    border: isLocked
                      ? "2px solid rgba(255,255,255,0.08)"
                      : isCurrent
                        ? "2px solid rgba(255,255,255,0.7)"
                        : isCompleted && s > 0
                          ? "2px solid rgba(251,191,36,0.6)"
                          : "2px solid rgba(139,92,246,0.4)",
                    boxShadow: isCurrent
                      ? "0 0 16px rgba(139,92,246,0.5), 0 0 4px rgba(255,255,255,0.3)"
                      : isCompleted && s > 0
                        ? "0 0 10px rgba(251,191,36,0.25)"
                        : "none",
                    animation: isCurrent ? "pulse 2s ease-in-out infinite" : "none",
                    transition: "transform 0.15s",
                  }}
                >
                  {isLocked ? (
                    <span style={{
                      fontSize: nodeSize * 0.35,
                      color: "rgba(255,255,255,0.15)",
                    }}>
                      🔒
                    </span>
                  ) : (
                    <span style={{
                      fontFamily: FONTS.orbitron,
                      fontSize: nodeSize * 0.32,
                      fontWeight: 700,
                      color: isCompleted && s > 0 ? "rgba(0,0,0,0.6)" : "#fff",
                    }}>
                      {n}
                    </span>
                  )}
                </div>

                {isCompleted && s > 0 && (
                  <div className="flex gap-px mt-1" style={{ fontSize: "0.65rem" }}>
                    {[1, 2, 3].map(i => (
                      <span key={i} style={{
                        color: i <= s ? "#fbbf24" : "rgba(255,255,255,0.15)",
                        textShadow: i <= s ? "0 0 4px rgba(251,191,36,0.4)" : "none",
                      }}>★</span>
                    ))}
                  </div>
                )}

                {isCurrent && (
                  <div style={{
                    fontSize: "0.55rem",
                    fontFamily: FONTS.default,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.6)",
                    marginTop: 2,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    Current
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
