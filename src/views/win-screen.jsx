// ============================================
// WIN SCREEN — victory overlay with stats
// ============================================

import React from 'react';
import { FONTS, UI, candy3d } from '../constants.js';
import { Confetti } from '../components.jsx';
import { ModalCard } from '../components/chrome.jsx';

export function WinScreen({ show, stars, moves, mopt, time, streak, onNext, onReplay, onOpenMap }) {
  if (!show) return null;

  const stats = [
    { value: moves, label: "moves", color: null },
    mopt > 0 ? { value: mopt, label: "optimal", color: "#c4aaff" } : null,
    { value: time, label: "time", color: null },
    streak > 1 ? { value: `🔥${streak}`, label: "streak", color: "#ff9040" } : null,
  ].filter(Boolean);

  return (
    <>
      <Confetti />
      <ModalCard
        show={show}
        title={null}
        ariaLabel="Level complete"
        backdropClose={false}
        showClose={false}
        zIndex={UI.z.win}
      >
        <div className="text-center">
          <div style={{ fontSize: "2.5rem", marginBottom: 6, animation: "float 2s ease-in-out infinite" }}>
            🎉
          </div>

          <h2 className="font-black tracking-wide mb-2" style={{
            fontFamily: FONTS.orbitron,
            fontSize: UI.font.xl,
            color: "#ffc83d",
            textShadow: "0 3px 0 #8a4d00, 0 6px 16px rgba(0,0,0,0.4)",
          }}>
            COMPLETE!
          </h2>

          {stars > 0 && (
            <div className="flex justify-center gap-1 mb-3" style={{ fontSize: "2.2rem" }}>
              {[1, 2, 3].map(i => (
                <span key={i} style={{
                  color: i <= stars ? "#ffd84d" : "rgba(255,255,255,0.15)",
                  textShadow: i <= stars ? "0 2px 0 #b06000, 0 0 14px rgba(255,200,60,0.7)" : "none",
                  animation: i <= stars ? `starPop 0.4s ease-out ${0.2 + i * 0.15}s both` : "none",
                  display: "inline-block",
                }}>
                  ★
                </span>
              ))}
            </div>
          )}

          {/* Stat tiles */}
          <div className="flex justify-center gap-2 mb-4" style={{ fontFamily: FONTS.default }}>
            {stats.map((stat, i) => (
              <div key={i} className="text-center px-3 py-2 flex-1" style={{
                background: UI.surface.raised,
                border: UI.border.subtle,
                borderRadius: UI.radius.md,
                minWidth: 0,
              }}>
                <div className="font-bold" style={{
                  fontSize: "1.1rem",
                  color: stat.color || "#fff",
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                  fontFamily: FONTS.orbitron,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: UI.font.xs, color: UI.text.muted }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onNext}
            className="candy-btn w-full py-3 font-bold text-white active:scale-95"
            style={{
              fontFamily: FONTS.orbitron,
              fontSize: UI.font.md,
              background: UI.accent.primaryGrad,
              boxShadow: `${candy3d("#3346c4", 4)}, 0 0 16px rgba(90,123,255,0.4)`,
              letterSpacing: "0.1em",
              minHeight: 48,
              borderRadius: UI.radius.pill,
              border: "2px solid rgba(255,255,255,0.65)",
              cursor: "pointer",
            }}
          >
            NEXT LEVEL →
          </button>

          {/* Secondary actions */}
          <div className="flex gap-2 mt-2">
            {onReplay && (
              <button
                onClick={onReplay}
                className="flex-1 py-2 font-semibold active:scale-95"
                style={{
                  fontFamily: FONTS.default,
                  fontSize: UI.font.sm,
                  color: UI.text.secondary,
                  background: UI.surface.base,
                  border: UI.border.subtle,
                  borderRadius: UI.radius.pill,
                  cursor: "pointer",
                }}
              >
                ↻ Replay
              </button>
            )}
            {onOpenMap && (
              <button
                onClick={onOpenMap}
                className="flex-1 py-2 font-semibold active:scale-95"
                style={{
                  fontFamily: FONTS.default,
                  fontSize: UI.font.sm,
                  color: UI.text.secondary,
                  background: UI.surface.base,
                  border: UI.border.subtle,
                  borderRadius: UI.radius.pill,
                  cursor: "pointer",
                }}
              >
                🗺 Map
              </button>
            )}
          </div>
        </div>
      </ModalCard>
    </>
  );
}
