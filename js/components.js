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
      left:     Math.random() * 100,
      top:      Math.random() * 100,
      size:     Math.random() * 2 + 0.5,
      delay:    Math.random() * 4,
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
            top:  `${s.top}%`,
            width:  s.size,
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
      id:       i,
      left:     Math.random() * 100,
      color:    MAIN_COLORS[i % MAIN_COLORS.length],
      delay:    Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      size:     4 + Math.random() * 5,
      drift:    (Math.random() - 0.5) * 80,
      rotation: Math.random() * 720,
    })),
  []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 60 }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position:        "absolute",
            left:            `${p.left}%`,
            top:             -20,
            width:           p.size,
            height:          p.size * 0.6,
            backgroundColor: p.color,
            borderRadius:    1,
            animation:       `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
            "--drift":       `${p.drift}px`,
            "--rot":         `${p.rotation}deg`,
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
  const w           = size;
  const bR          = Math.round(w * 0.25);
  const doneColor   = completed ? getColor(segments[0]) : null;

  // Image-based bottle dimensions
  // The PNG has a neck region (~18% top) and base (~8% bottom); liquid fills the middle ~74%
  const imgW        = w;
  const imgH        = Math.round(w * 2.8);   // aspect ratio of the PNG (~1:2.8)
  const liquidTop   = Math.round(imgH * 0.18);
  const liquidBot   = Math.round(imgH * 0.08);
  const liquidH     = imgH - liquidTop - liquidBot;

  return (
    <div
      onClick={onClick}
      className="relative"
      style={{
        width:    imgW,
        height:   imgH,
        minWidth: 44,
        minHeight: 44,
        cursor:   "pointer",
        WebkitTapHighlightColor: "transparent",
        transition: shaking ? "none" : "transform 0.15s ease-out, filter 0.15s ease-out",
        transform:  shaking  ? "translateX(0)"
                  : selected ? "translateY(-10px) scale(1.04)"
                  : "scale(1)",
        filter: selected  ? "drop-shadow(0 0 10px rgba(255,255,255,0.5))"
              : completed ? `drop-shadow(0 0 6px ${doneColor}55)`
              : "none",
        animation: shaking ? "shake 0.3s ease-out"
                 : hinted  ? "hintPulse 0.8s ease-in-out 2"
                 : "none",
      }}
    >
      {/* Hint ring */}
      {hinted && !selected && (
        <div className="absolute pointer-events-none" style={{
          inset: -3,
          border: "2px solid rgba(139,92,246,0.6)",
          borderRadius: bR + 5,
          animation: "hintPulse 0.8s ease-in-out 2",
        }} />
      )}

      {/* Liquid segments — clipped to the body area of the PNG */}
      <div
        className="absolute overflow-hidden"
        style={{
          left:   0,
          right:  0,
          top:    liquidTop,
          height: liquidH,
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse">
          {segments.map((colorIndex, i) => {
            const visible = hiddenCount === 0 || (revealedArr && revealedArr[i]);
            const bg      = visible ? getColor(colorIndex) : "#1a1530";
            const isTop   = i === segments.length - 1;
            const sliceH  = Math.round(liquidH / BOTTLE_CAPACITY);

            return (
              <div key={i} className="relative" style={{ height: sliceH, backgroundColor: bg }}>
                {/* Wave on top surface */}
                {isTop && visible && (
                  <div className="absolute top-0 left-0 right-0" style={{
                    height:     Math.max(2, sliceH * 0.1),
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.3) 70%, transparent)",
                    animation:  "wave 3s ease-in-out infinite",
                  }} />
                )}

                {/* Accessibility pattern */}
                {visible && patMode && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{
                    color:        "rgba(0,0,0,0.25)",
                    fontSize:     Math.max(8, sliceH * 0.3),
                    fontWeight:   700,
                    userSelect:   "none",
                    letterSpacing: 1,
                  }}>
                    {PATTERNS[colorIndex % PATTERNS.length]}
                  </div>
                )}

                {/* Hidden indicator */}
                {!visible && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{
                    color:      "rgba(255,255,255,0.1)",
                    fontSize:   Math.max(10, sliceH * 0.35),
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
                  height:          sliceH,
                  backgroundColor: getColor(ghostColor),
                  opacity:         0.25,
                  borderTop:       gi === 0 ? "2px dashed rgba(255,255,255,0.3)" : "none",
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
          inset: -2,
          border: "2px solid rgba(255,255,255,0.3)",
          borderRadius: bR + 4,
        }} />
      )}

      {/* Completion checkmark */}
      {completed && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 5 }}>
          <div style={{
            width:          imgW * 0.4,
            height:         imgW * 0.4,
            borderRadius:   "50%",
            background:     `${doneColor}30`,
            border:         `2px solid ${doneColor}88`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            color:          doneColor,
            fontSize:       imgW * 0.22,
            fontWeight:     900,
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
          color:      "rgba(255,255,255,0.4)",
          fontSize:   "0.7rem",
          fontFamily: FONTS.default,
          padding:    "3px 0",
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
                width:           9,
                height:          9,
                backgroundColor: getColor(i),
                boxShadow:       `0 0 3px ${getColor(i)}44`,
              }} />
              <span style={{
                color:      "rgba(255,255,255,0.4)",
                fontSize:   "0.65rem",
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
          border:     "1px solid rgba(255,255,255,0.12)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-bold text-center mb-3" style={{
          fontFamily: FONTS.orbitron,
          fontSize:   "1rem",
          color:      "rgba(255,255,255,0.85)",
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
            border:     "1px solid rgba(255,255,255,0.15)",
            color:      "#fff",
            fontSize:   "1.25rem",
            fontFamily: FONTS.orbitron,
          }}
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold active:scale-95"
            style={{
              background: "rgba(255,255,255,0.08)",
              color:      "rgba(255,255,255,0.6)",
              fontSize:   "0.85rem",
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
              fontSize:   "0.85rem",
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
