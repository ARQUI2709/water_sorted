// ============================================
// WIN SCREEN — victory overlay with stats
// ============================================

import React from 'react';
import { FONTS, UI } from '../constants.js';
import { Confetti } from '../components.jsx';
import { ModalCard } from '../components/chrome.jsx';

export function WinScreen({ show, stars, moves, mopt, time, streak, onNext, onReplay, onOpenMap }) {
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

          <h2 className="font-black tracking-wider mb-2" style={{
            fontFamily: FONTS.orbitron,
            fontSize: UI.font.xl,
            background: "linear-gradient(135deg,#fbbf24,#f59e0b,#fbbf24)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 2s linear infinite",
          }}>
            COMPLETE!
          </h2>

          {stars > 0 && (
            <div className="flex justify-center gap-1 mb-3" style={{ fontSize: "1.6rem" }}>
              {[1, 2, 3].map(i => (
                <span key={i} style={{
                  color: i <= stars ? UI.accent.gold : "rgba(255,255,255,0.15)",
                  textShadow: i <= stars ? "0 0 8px rgba(251,191,36,0.5)" : "none",
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
                background: UI.surface.base,
                border: UI.border.subtle,
                borderRadius: UI.radius.sm,
                minWidth: 0,
              }}>
                <div className="font-bold" style={{
                  fontSize: "1.15rem",
                  color: stat.color || "#ddd6fe",
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
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
            className="w-full py-3 font-bold text-white active:scale-95"
            style={{
              fontFamily: FONTS.orbitron,
              fontSize: UI.font.md,
              background: UI.accent.primaryGrad,
              boxShadow: "0 4px 16px rgba(139,92,246,0.35)",
              letterSpacing: "0.1em",
              minHeight: 48,
              borderRadius: UI.radius.md,
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
                  borderRadius: UI.radius.md,
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
                  borderRadius: UI.radius.md,
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
