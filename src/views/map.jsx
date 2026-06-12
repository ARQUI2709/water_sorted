// ============================================
// LEVEL MAP — grid-based level selector
// ============================================

import React from 'react';
import { FONTS, UI } from '../constants.js';
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
            gap: 12,
          }}
        >
          {levels.map(({ n, stars: s, isCompleted, isLocked, isCurrent }) => {
            const canTap = !isLocked;
            const bg = isLocked
              ? "linear-gradient(180deg, #6b7a8d 0%, #4a5568 55%, #374151 100%)"
              : isCompleted && s > 0
                ? "linear-gradient(180deg, #fde68a 0%, #f59e0b 50%, #b45309 100%)"
                : isCurrent
                  ? "linear-gradient(180deg, #67e8f9 0%, #22d3ee 45%, #0891b2 100%)"
                  : "linear-gradient(180deg, #93c5fd 0%, #3b82f6 50%, #1d4ed8 100%)";

            const shadow = isLocked
              ? "0 5px 0 #1f2937, inset 0 1px 0 rgba(255,255,255,0.18)"
              : isCompleted && s > 0
                ? "0 5px 0 #92400e, inset 0 1px 0 rgba(255,255,255,0.35)"
                : isCurrent
                  ? "0 5px 0 #0e7490, 0 0 18px rgba(34,211,238,0.45), inset 0 1px 0 rgba(255,255,255,0.45)"
                  : "0 5px 0 #1e40af, inset 0 1px 0 rgba(255,255,255,0.3)";

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
                  borderRadius: 18,
                  border: isCurrent
                    ? "2.5px solid rgba(255,255,255,0.75)"
                    : isLocked
                      ? "2px solid rgba(255,255,255,0.08)"
                      : "2px solid rgba(255,255,255,0.22)",
                  padding: 0,
                  cursor: canTap ? "pointer" : "default",
                  background: bg,
                  boxShadow: shadow,
                  transition: "transform 0.1s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                }}
              >
                {isLocked ? (
                  <span style={{ fontSize: "1.5em", filter: "grayscale(0.3)" }}>🔒</span>
                ) : (
                  <>
                    <span style={{
                      fontFamily: FONTS.orbitron,
                      fontWeight: 700,
                      fontSize: "1.5em",
                      color: isCompleted && s > 0 ? "rgba(0,0,0,0.75)" : "#fff",
                      textShadow: isCompleted && s > 0 ? "none" : "0 1px 3px rgba(0,0,0,0.4)",
                      lineHeight: 1,
                    }}>
                      {n}
                    </span>
                    {s > 0 && (
                      <div style={{ display: "flex", gap: 1 }}>
                        {[1, 2, 3].map(i => (
                          <span key={i} style={{
                            fontSize: "1.5em",
                            color: i <= s ? "#fef08a" : "rgba(0,0,0,0.25)",
                            textShadow: i <= s ? "0 0 4px rgba(253,224,71,0.6)" : "none",
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
