// ============================================
// SHARED COMPONENTS — reusable primitives
// ============================================

import React from 'react';
import { BOTTLE_CAPACITY, MAIN_COLORS, COLOR_NAMES, PATTERNS, FONTS, UI, getColor, candy3d } from './constants.js';

// --------------------------------------------
// Stars — animated night-sky background layer
// decor=true adds bubbles + glow blobs (default background only)
// --------------------------------------------
export function Stars({ decor = false }) {
  const dots = React.useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: `d${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 4,
      duration: Math.random() * 2 + 2,
    })),
    []);

  const sparkles = React.useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: `s${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 6 + Math.random() * 10,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
    })),
    []);

  const bubbles = React.useMemo(() => decor
    ? Array.from({ length: 6 }, (_, i) => ({
        id: `b${i}`,
        left: Math.random() * 85 + 5,
        size: 12 + Math.random() * 28,
        delay: Math.random() * 8,
        duration: 14 + Math.random() * 12,
        dx: (Math.random() - 0.5) * 60,
      }))
    : [],
    [decor]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: UI.z.bg }}>
      {/* Dot stars */}
      {dots.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white" style={{
          left: `${s.left}%`, top: `${s.top}%`,
          width: s.size, height: s.size,
          animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          opacity: 0.3,
        }} />
      ))}

      {/* 4-point sparkles */}
      {sparkles.map(s => (
        <div key={s.id} className="absolute sparkle4" style={{
          left: `${s.left}%`, top: `${s.top}%`,
          width: s.size, height: s.size,
          transform: 'translate(-50%,-50%)',
          animation: `sparkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}

      {/* Rising bubbles (default background only) */}
      {bubbles.map(b => (
        <div key={b.id} className="absolute bubble-deco" style={{
          left: `${b.left}%`,
          bottom: '-8%',
          width: b.size,
          height: b.size,
          animation: `bubbleRise ${b.duration}s ease-in ${b.delay}s infinite`,
          '--bx': `${b.dx}px`,
        }} />
      ))}

      {/* Pastel glow blobs (default background only) */}
      {decor && (
        <>
          <div className="absolute pointer-events-none" style={{
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,100,220,0.12), transparent 65%)',
            top: '1%', left: '-8%', filter: 'blur(35px)',
            animation: 'blobDrift 12s ease-in-out infinite',
          }} />
          <div className="absolute pointer-events-none" style={{
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(60,200,255,0.10), transparent 65%)',
            top: '4%', right: '-10%', filter: 'blur(28px)',
            animation: 'blobDrift 15s ease-in-out 3s infinite',
          }} />
          <div className="absolute pointer-events-none" style={{
            width: 180, height: 180, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(120,70,255,0.09), transparent 65%)',
            bottom: '4%', left: '3%', filter: 'blur(32px)',
            animation: 'blobDrift 18s ease-in-out 6s infinite',
          }} />
          {/* Bottom bokeh glow */}
          <div className="absolute pointer-events-none" style={{
            width: '100%', height: '30vh', bottom: 0, left: 0,
            background: 'radial-gradient(ellipse at 50% 115%, rgba(70,90,255,0.22), rgba(30,55,180,0.08) 45%, transparent 70%)',
          }} />
        </>
      )}
    </div>
  );
}

// --------------------------------------------
// Confetti — win screen celebration
// --------------------------------------------
export function Confetti() {
  const particles = React.useMemo(() =>
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
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: UI.z.confetti }}>
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
// BottleGlass — pure SVG glossy glass overlay
// Render over the liquid container; z-index 2 so it overlays liquid.
// --------------------------------------------
export function BottleGlass({ w, h }) {
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 280"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    >
      {/* Outer glass body — light fill + white stroke */}
      <path
        d="M 27,4 L 73,4 Q 75,4 74,9 L 70,30 Q 79,32 85,39 L 91,50 Q 94,64 94,72 L 94,237 Q 94,267 62,271 L 38,271 Q 6,267 6,237 L 6,72 Q 6,64 9,50 L 15,39 Q 21,32 30,30 L 26,9 Q 25,4 27,4 Z"
        fill="rgba(255,255,255,0.07)"
        stroke="rgba(255,255,255,0.68)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Inner depth line */}
      <path
        d="M 27,4 L 73,4 Q 75,4 74,9 L 70,30 Q 79,32 85,39 L 91,50 Q 94,64 94,72 L 94,237 Q 94,267 62,271 L 38,271 Q 6,267 6,237 L 6,72 Q 6,64 9,50 L 15,39 Q 21,32 30,30 L 26,9 Q 25,4 27,4 Z"
        fill="none"
        stroke="rgba(10,14,60,0.28)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        transform="translate(1,1)"
      />

      {/* Left gloss stripe */}
      <rect x="10" y="72" width="9" height="158" rx="4" ry="4"
        fill="rgba(255,255,255,0.28)"
      />
      {/* Neck gloss dot */}
      <ellipse cx="15" cy="52" rx="6" ry="4"
        fill="rgba(255,255,255,0.20)"
      />
      {/* Bottom inner shadow */}
      <ellipse cx="50" cy="259" rx="31" ry="9"
        fill="rgba(0,0,0,0.18)"
      />
    </svg>
  );
}

// --------------------------------------------
// Bottle — single bottle with liquid layers
// --------------------------------------------
export function Bottle({
  segments, revealedArr, selected, completed,
  onClick, hiddenCount, shaking, size,
  ghostCount, ghostColor, hinted, patMode,
  index, pourIn, pourOut,
}) {
  const w = size;
  const doneColor = completed ? getColor(segments[0]) : null;

  const imgW = w;
  const imgH = Math.round(w * 2.8);
  const liquidTop = Math.round(imgH * 0.20);
  const liquidBot = Math.round(imgH * 0.03);
  const liquidH = imgH - liquidTop - liquidBot;
  const liqInset = Math.round(w * 0.07);
  const liqW = w - liqInset * 2;

  return (
    <button
      onClick={onClick}
      aria-label={`Bottle ${(index ?? 0) + 1}`}
      aria-pressed={!!selected}
      className="relative"
      style={{
        width: imgW,
        height: imgH,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        transition: shaking ? "none" : "transform 0.15s ease-out, filter 0.15s ease-out",
        transform: shaking ? "translateX(0)"
          : selected ? "translateY(-10px) scale(1.04)"
            : "scale(1)",
        filter: selected ? "drop-shadow(0 0 12px rgba(255,255,255,0.65))"
          : hinted ? "drop-shadow(0 0 9px rgba(160,100,255,0.75))"
            : completed ? `drop-shadow(0 0 8px ${doneColor}88)`
              : "none",
        animation: shaking ? "shake 0.3s ease-out"
          : hinted ? "hintPulse 0.8s ease-in-out 2"
            : "none",
      }}
    >
      {/* Liquid segments */}
      <div
        className="absolute overflow-hidden"
        style={{
          width: liqW,
          left: liqInset,
          top: liquidTop,
          height: liquidH,
          borderRadius: `0 0 ${Math.round(w * 0.30)}px ${Math.round(w * 0.30)}px`,
          zIndex: 1,
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse">
          {segments.map((colorIndex, i) => {
            const visible = hiddenCount === 0 || (revealedArr && revealedArr[i]);
            const bg = visible ? getColor(colorIndex) : "#1a1e50";
            const isTop = i === segments.length - 1;
            const sliceH = Math.round(liquidH / BOTTLE_CAPACITY);
            const fillIdx = pourIn ? i - (segments.length - pourIn.count) : -1;

            return (
              <div key={i} className="relative" style={{
                height: sliceH,
                backgroundColor: bg,
                ...(fillIdx >= 0 ? {
                  animation: `fillUp 0.3s ease-out ${0.05 + fillIdx * 0.06}s both`,
                  transformOrigin: "bottom",
                } : {}),
              }}>
                {isTop && visible && (
                  <div className="absolute top-0 left-0 right-0" style={{
                    height: Math.max(2, sliceH * 0.1),
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.3) 70%, transparent)",
                    animation: "wave 3s ease-in-out infinite",
                  }} />
                )}
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
                {!visible && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{
                    color: "rgba(255,255,255,0.40)",
                    fontSize: Math.max(10, sliceH * 0.38),
                    fontWeight: 900,
                    fontFamily: FONTS.orbitron,
                    userSelect: "none",
                  }}>
                    ?
                  </div>
                )}
              </div>
            );
          })}

          {/* Drain overlay — liquid that just left this bottle fades out above the new top */}
          {pourOut && pourOut.count > 0 &&
            Array.from({ length: pourOut.count }, (_, di) => {
              const sliceH = Math.round(liquidH / BOTTLE_CAPACITY);
              return (
                <div key={`d${pourOut.key}-${di}`} className="pointer-events-none" style={{
                  height: sliceH,
                  backgroundColor: getColor(pourOut.color),
                  animation: `drainOut 0.3s ease-in ${0.2 + (pourOut.count - 1 - di) * 0.3}s both`,
                  transformOrigin: "bottom",
                }} />
              );
            })
          }

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

      {/* SVG glass overlay */}
      <BottleGlass w={imgW} h={imgH} />

      {/* Completion checkmark — glossy green circle */}
      {completed && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 5 }}>
          <div style={{
            width: imgW * 0.44,
            height: imgW * 0.44,
            borderRadius: "50%",
            background: UI.candy.button.green.grad,
            boxShadow: `0 3px 0 ${UI.candy.button.green.edge}, 0 5px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.45)`,
            border: "2px solid rgba(255,255,255,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: imgW * 0.22,
            fontWeight: 900,
          }}>
            ✓
          </div>
        </div>
      )}
    </button>
  );
}

// --------------------------------------------
// Legend — color reference panel
// --------------------------------------------
export function Legend({ numColors, open, toggle, patMode }) {
  if (numColors <= 6) return null;

  return (
    <div className="w-full px-3 shrink-0" style={{ position: "relative", zIndex: 15 }}>
      <button
        onClick={toggle}
        className="flex items-center gap-1 mx-auto"
        style={{
          color: "rgba(255,255,255,0.45)",
          fontSize: "0.7rem",
          fontFamily: FONTS.default,
          padding: "3px 0",
          fontWeight: 700,
        }}
      >
        {open ? "▾" : "▸"} {numColors} colors
      </button>

      {open && (
        <div className="flex flex-wrap justify-center gap-1 pb-1">
          {Array.from({ length: numColors }, (_, i) => (
            <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded"
              style={{ background: UI.surface.raised, border: UI.border.subtle }}
            >
              <div className="rounded-full" style={{
                width: 9,
                height: 9,
                backgroundColor: getColor(i),
                boxShadow: `0 0 3px ${getColor(i)}66`,
              }} />
              <span style={{
                color: "rgba(255,255,255,0.5)",
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
