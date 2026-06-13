// ============================================
// LEVEL MAP — grid-based level selector
// ============================================

import React from 'react';
import { FONTS, UI, candy3d } from '../constants.js';
import { getBestStars } from '../storage.js';
import { FullScreenPanel } from '../components/chrome.jsx';

const COLS = 5;

export function LevelMap({ show, onClose, currentLevel, maxLevel, onSelectLevel }) {
  const currentRef = React.useRef(null);

  const totalLevels = Math.max(60, maxLevel + 5);

  const levels = React.useMemo(() => {
    const arr = [];
    for (let n = 1; n <= totalLevels; n++) {
      const s = getBestStars(n);
      arr.push({
        n,
        stars: s,
        isCompleted: n < maxLevel || s > 0,
        isLocked: n > maxLevel,
        isCurrent: n === currentLevel,
      });
    }
    return arr;
    // `show` re-reads stars earned since last open
  }, [totalLevels, show, currentLevel, maxLevel]);

  React.useEffect(() => {
    if (show && currentRef.current) {
      setTimeout(() => {
        currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);
    }
  }, [show]);

  if (!show) return null;

  return (
    <FullScreenPanel show={show} onClose={onClose} title="LEVELS">
      <div className="flex-1 overflow-y-auto" style={{ padding: "12px 16px 48px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: 10,
          }}
        >
          {levels.map(({ n, stars: s, isCompleted, isLocked, isCurrent }) => {
            const canTap = !isLocked;

            const t = isLocked ? UI.candy.tile.locked
                    : isCurrent ? UI.candy.tile.current
                    : isCompleted && s > 0 ? UI.candy.tile.done
                    : UI.candy.tile.locked;

            const shadow = isCurrent
              ? `${candy3d(t.edge, 5)}, ${t.glow}`
              : candy3d(t.edge, 5);

            return (
              <button
                key={n}
                ref={isCurrent ? currentRef : null}
                onClick={canTap ? () => onSelectLevel(n) : undefined}
                disabled={!canTap}
                aria-label={
                  isLocked
                    ? `Level ${n}, locked`
                    : `Level ${n}${s > 0 ? `, ${s} stars` : ""}${isCurrent ? ", current" : ""}`
                }
                className="active:scale-95"
                style={{
                  aspectRatio: "1",
                  borderRadius: "24%",
                  border: isCurrent
                    ? "2.5px solid rgba(255,255,255,0.80)"
                    : isLocked
                      ? "1.5px solid rgba(255,255,255,0.12)"
                      : "2px solid rgba(255,255,255,0.30)",
                  padding: 0,
                  cursor: canTap ? "pointer" : "default",
                  background: t.grad,
                  boxShadow: shadow,
                  transition: "transform 0.1s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  filter: isLocked && !isCurrent ? "saturate(0.7) brightness(0.9)" : "none",
                }}
              >
                {isLocked ? (
                  <div className="flex flex-col items-center gap-0.5">
                    <span style={{
                      fontFamily: FONTS.orbitron,
                      fontWeight: 700,
                      fontSize: "1.3em",
                      color: "rgba(255,255,255,0.85)",
                      textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                      lineHeight: 1,
                    }}>
                      {n}
                    </span>
                    <span style={{ fontSize: "0.7em", opacity: 0.6 }}>🔒</span>
                  </div>
                ) : (
                  <>
                    <span style={{
                      fontFamily: FONTS.orbitron,
                      fontWeight: 700,
                      fontSize: "1.5em",
                      color: "#fff",
                      textShadow: "0 2px 0 rgba(0,0,0,0.25)",
                      lineHeight: 1,
                    }}>
                      {n}
                    </span>
                    {s > 0 && (
                      <div style={{ display: "flex", gap: 0 }}>
                        {[1, 2, 3].map(i => (
                          <span key={i} style={{
                            fontSize: "0.9em",
                            color: i <= s ? "#ffe27a" : "rgba(0,0,0,0.25)",
                            textShadow: i <= s ? "0 1px 0 rgba(140,80,0,0.5)" : "none",
                          }}>★</span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </FullScreenPanel>
  );
}
