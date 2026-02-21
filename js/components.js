// ============================================
// REUSABLE REACT COMPONENTS
// ============================================

const { useMemo, useEffect, useRef, useCallback, useState } = React;

// --------------------------------------------
// Stars — animated background
// --------------------------------------------
function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 4,
      duration: Math.random() * 2 + 2,
    })),
    []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  );
}

// --------------------------------------------
// Confetti — win screen celebration
// --------------------------------------------
function Confetti() {
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: MAIN_COLORS[i % MAIN_COLORS.length],
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 5,
      drift: (Math.random() - 0.5) * 80,
      rotation: Math.random() * 720,
    })),
    []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 60 }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: 1,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
            "--drift": `${p.drift}px`,
            "--rot": `${p.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
}

// --------------------------------------------
// Bottle — single bottle with liquid layers
// --------------------------------------------
function Bottle({
  segments, revealedArr, selected, completed,
  onClick, hiddenCount, shaking, size,
  ghostCount, ghostColor, hinted, patMode,
}) {
  const w = size;
  const bR = Math.round(w * 0.25);
  const doneColor = completed ? getColor(segments[0]) : null;

  // Image-based bottle dimensions
  // The PNG interior: neck ends ~22% from top, base ~5% from bottom, walls ~14% each side
  const imgW = w;
  const imgH = Math.round(w * 2.8);   // aspect ratio of the PNG (~1:2.8)
  const liquidTop = Math.round(imgH * 0.22);
  const liquidBot = Math.round(imgH * 0.05);
  const liquidH = imgH - liquidTop - liquidBot;
  const liquidPadX = Math.round(w * 0.9);  // inset from bottle walls

  return (
    <div
      onClick={onClick}
      className="relative"
      style={{
        width: imgW,
        height: imgH,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        transition: shaking ? "none" : "transform 0.15s ease-out, filter 0.15s ease-out",
        transform: shaking ? "translateX(0)"
          : selected ? "translateY(-10px) scale(1.04)"
            : "scale(1)",
        filter: selected ? "drop-shadow(0 0 10px rgba(255,255,255,0.5))"
          : completed ? `drop-shadow(0 0 6px ${doneColor}55)`
            : "none",
        animation: shaking ? "shake 0.3s ease-out"
          : hinted ? "hintPulse 0.8s ease-in-out 2"
            : "none",
      }}
    >
      {/* Hint ring */}
      {hinted && !selected && (
        <div className="absolute pointer-events-none" style={{
          top: -3, left: -3,
          width: imgW + 6, height: imgH + 6,
          border: "2px solid rgba(139,92,246,0.6)",
          borderRadius: bR + 5,
          animation: "hintPulse 0.8s ease-in-out 2",
        }} />
      )}

      {/* Liquid segments — clipped to the body area of the PNG */}
      <div
        className="absolute overflow-hidden"
        style={{
          width: liquidPadX,
          left: liquidPadX,
          transform: "translateX(-99%)",
          top: liquidTop,
          height: liquidH,
          borderRadius: `0 0 ${Math.round(w * 0.1)}px ${Math.round(w * 0.1)}px`,
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse">
          {segments.map((colorIndex, i) => {
            const visible = hiddenCount === 0 || (revealedArr && revealedArr[i]);
            const bg = visible ? getColor(colorIndex) : "#1a1530";
            const isTop = i === segments.length - 1;
            const sliceH = Math.round(liquidH / BOTTLE_CAPACITY);

            return (
              <div key={i} className="relative" style={{ height: sliceH, backgroundColor: bg }}>
                {/* Wave on top surface */}
                {isTop && visible && (
                  <div className="absolute top-0 left-0 right-0" style={{
                    height: Math.max(2, sliceH * 0.1),
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.3) 70%, transparent)",
                    animation: "wave 3s ease-in-out infinite",
                  }} />
                )}

                {/* Accessibility pattern */}
                {visible && patMode && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{
                    color: "rgba(0,0,0,0.25)",
                    fontSize: Math.max(8, sliceH * 0.3),
                    fontWeight: 700,
                    userSelect: "none",
                    letterSpacing: 1,
                  }}>
                    {PATTERNS[colorIndex % PATTERNS.length]}
                  </div>
                )}

                {/* Hidden indicator */}
                {!visible && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{
                    color: "rgba(255,255,255,0.1)",
                    fontSize: Math.max(10, sliceH * 0.35),
                    fontWeight: 700,
                    fontFamily: FONTS.orbitron,
                    userSelect: "none",
                  }}>
                    ?
                  </div>
                )}
              </div>
            );
          })}

          {/* Ghost pour preview */}
          {ghostCount > 0 && ghostColor !== null &&
            Array.from({ length: ghostCount }, (_, gi) => {
              const sliceH = Math.round(liquidH / BOTTLE_CAPACITY);
              return (
                <div key={`g${gi}`} style={{
                  height: sliceH,
                  backgroundColor: getColor(ghostColor),
                  opacity: 0.25,
                  borderTop: gi === 0 ? "2px dashed rgba(255,255,255,0.3)" : "none",
                }} />
              );
            })
          }
        </div>
      </div>

      {/* Bottle PNG overlay — sits on top of liquid */}
      <img
        src="assets/bottle.png"
        alt=""
        draggable={false}
        className="absolute inset-0 pointer-events-none"
        style={{ width: imgW, height: imgH, objectFit: "fill" }}
      />

      {/* Selection ring */}
      {selected && (
        <div className="absolute pointer-events-none" style={{
          top: -2, left: -2,
          width: imgW + 4, height: imgH + 4,
          border: "2px solid rgba(255,255,255,0.3)",
          borderRadius: bR + 4,
        }} />
      )}

      {/* Completion checkmark */}
      {completed && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 5 }}>
          <div style={{
            width: imgW * 0.4,
            height: imgW * 0.4,
            borderRadius: "50%",
            background: `${doneColor}30`,
            border: `2px solid ${doneColor}88`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: doneColor,
            fontSize: imgW * 0.22,
            fontWeight: 900,
            backdropFilter: "blur(2px)",
          }}>
            ✓
          </div>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------
// Legend — color reference panel
// --------------------------------------------
function Legend({ numColors, open, toggle, patMode }) {
  if (numColors <= 6) return null;

  return (
    <div className="w-full px-3 shrink-0" style={{ position: "relative", zIndex: 15 }}>
      <button
        onClick={toggle}
        className="flex items-center gap-1 mx-auto"
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: "0.7rem",
          fontFamily: FONTS.default,
          padding: "3px 0",
          fontWeight: 600,
        }}
      >
        {open ? "▾" : "▸"} {numColors} colors
      </button>

      {open && (
        <div className="flex flex-wrap justify-center gap-1 pb-1">
          {Array.from({ length: numColors }, (_, i) => (
            <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div className="rounded-full" style={{
                width: 9,
                height: 9,
                backgroundColor: getColor(i),
                boxShadow: `0 0 3px ${getColor(i)}44`,
              }} />
              <span style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.65rem",
                fontFamily: FONTS.default,
                fontWeight: 600,
              }}>
                {patMode ? PATTERNS[i % PATTERNS.length] + " " : ""}
                {COLOR_NAMES[i] || `C${i + 1}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------
// LevelJump — modal to jump to any level
// --------------------------------------------
function LevelJump({ show, onClose, onGo }) {
  const [value, setValue] = useState("");

  if (!show) return null;

  const handleGo = () => {
    const n = parseInt(value);
    if (n > 0) { onGo(n); onClose(); }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-6"
      style={{ zIndex: 70, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="p-5 rounded-2xl w-full max-w-xs"
        style={{
          background: "linear-gradient(160deg, rgba(30,20,60,0.97), rgba(20,15,45,0.97))",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-bold text-center mb-3" style={{
          fontFamily: FONTS.orbitron,
          fontSize: "1rem",
          color: "rgba(255,255,255,0.85)",
        }}>
          GO TO LEVEL
        </h3>

        <input
          type="number"
          inputMode="numeric"
          min="1"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleGo()}
          autoFocus
          placeholder="Level #"
          className="w-full px-4 py-3 rounded-xl text-center font-bold outline-none"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            fontSize: "1.25rem",
            fontFamily: FONTS.orbitron,
          }}
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold active:scale-95"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.85rem",
              fontFamily: FONTS.default,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGo}
            className="flex-1 py-2.5 rounded-xl font-bold text-white active:scale-95"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              fontSize: "0.85rem",
              fontFamily: FONTS.orbitron,
            }}
          >
            GO
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------
// LevelMap — visual level selector with path
// --------------------------------------------
function LevelMap({ show, onClose, currentLevel, onSelectLevel }) {
  const scrollRef = useRef(null);
  const currentRef = useRef(null);

  const totalLevels = Math.max(20, currentLevel + 5);
  const nodeSpacing = 90;
  const amplitude = 80;
  const svgWidth = 300;
  const svgPadTop = 60;
  const svgPadBot = 40;
  const totalHeight = totalLevels * nodeSpacing + svgPadTop + svgPadBot;
  const cx = svgWidth / 2;

  // Compute node positions (bottom-to-top: level 1 at bottom)
  const nodes = useMemo(() => {
    const arr = [];
    for (let n = 1; n <= totalLevels; n++) {
      const y = totalHeight - svgPadBot - ((n - 1) * nodeSpacing) - 24;
      const x = cx + amplitude * Math.sin(n * 0.8);
      const s = getBestStars(n);
      arr.push({ n, x, y, stars: s });
    }
    return arr;
  }, [totalLevels, totalHeight]);

  // Build SVG path through all nodes
  const pathD = useMemo(() => {
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

  // Auto-scroll to current level on open
  useEffect(() => {
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
            {/* Highlighted path up to current level */}
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
                {/* Circle */}
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

                {/* Stars below completed levels */}
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

                {/* "Current" label */}
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

// --------------------------------------------
// SettingsModal — gear menu with difficulty
// --------------------------------------------
function SettingsModal({ show, onClose, difficulty, onChangeDifficulty }) {
  if (!show) return null;

  const tiers = [
    { key: 'easy',   label: 'EASY',   color: '#4ade80', desc: 'More empty bottles' },
    { key: 'normal', label: 'NORMAL', color: '#facc15', desc: 'Balanced' },
    { key: 'hard',   label: 'HARD',   color: '#f87171', desc: 'Fewer empty bottles' },
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-6"
      style={{ zIndex: 70, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="p-5 rounded-2xl w-full max-w-xs"
        style={{
          background: "linear-gradient(160deg, rgba(30,20,60,0.97), rgba(20,15,45,0.97))",
          border: "1px solid rgba(255,255,255,0.12)",
          animation: "bounceIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-bold text-center mb-4" style={{
          fontFamily: FONTS.orbitron,
          fontSize: "1rem",
          color: "rgba(255,255,255,0.85)",
        }}>
          SETTINGS
        </h3>

        <div style={{
          fontSize: "0.7rem", fontFamily: FONTS.default, fontWeight: 600,
          color: "rgba(255,255,255,0.45)", marginBottom: 8, textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Difficulty
        </div>

        <div className="flex gap-2 mb-4">
          {tiers.map(t => {
            const active = difficulty === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onChangeDifficulty(t.key)}
                className="flex-1 flex flex-col items-center py-2.5 rounded-xl active:scale-95"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${t.color}22, ${t.color}11)`
                    : "rgba(255,255,255,0.05)",
                  border: active
                    ? `2px solid ${t.color}88`
                    : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{
                  fontFamily: FONTS.orbitron,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: active ? t.color : "rgba(255,255,255,0.5)",
                }}>
                  {t.label}
                </span>
                <span style={{
                  fontSize: "0.55rem",
                  fontFamily: FONTS.default,
                  color: active ? `${t.color}aa` : "rgba(255,255,255,0.25)",
                  marginTop: 2,
                }}>
                  {t.desc}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-semibold active:scale-95"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.85rem",
            fontFamily: FONTS.default,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// --------------------------------------------
// useTimer — countdown/up timer hook
// --------------------------------------------
function useTimer(running) {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(ref.current);
    }
    return () => clearInterval(ref.current);
  }, [running]);

  const reset = useCallback(() => setSeconds(0), []);

  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return { sec: seconds, time, reset };
}
