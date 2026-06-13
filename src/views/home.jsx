// ============================================
// HOME SCREEN — title, stats, navigation
// ============================================

import React from 'react';
import { FONTS, MAIN_COLORS, UI, candy3d } from '../constants.js';
import { Stars, BottleGlass } from '../components.jsx';
import Footer from '../components/Footer.jsx';

export function HomeScreen({
  show, level, totalStars, streak, difficulty,
  onPlay, onOpenMap, onOpenSettings, onOpenAchievements,
}) {
  if (!show) return null;

  const diffColor = difficulty === 'easy' ? '#3fd68f'
                  : difficulty === 'hard' ? '#ff6fae'
                  : '#ffd96a';

  const navButtons = [
    { icon: '🗺', label: 'MAP',      fn: onOpenMap },
    { icon: '🏆', label: 'AWARDS',   fn: onOpenAchievements },
    { icon: '⚙',  label: 'SETTINGS', fn: onOpenSettings },
  ];

  // Decorative bottle dimensions — scales down on short viewports
  const vh = typeof window !== "undefined" ? window.innerHeight : 720;
  const bw = Math.min(92, Math.round(vh * 0.12));
  const bh = Math.round(bw * 2.8);
  const liqTop = Math.round(bh * 0.22);
  const liqH = Math.round(bh * 0.73);
  const liqInset = Math.round(bw * 0.07);
  const liqW = bw - liqInset * 2;
  const sliceH = Math.round(liqH / 4);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between select-none"
      style={{
        zIndex: UI.z.home,
        background: `radial-gradient(120% 80% at 50% 0%, #131a55 0%, transparent 55%), linear-gradient(180deg, #070b26, #101750 55%, #1b2468)`,
        paddingTop: "max(24px, env(safe-area-inset-top, 24px))",
        paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))",
      }}
    >
      <Stars decor />

      {/* Top spacer */}
      <div className="flex-1" />

      {/* Animated bottle */}
      <div className="relative" style={{
        width: bw,
        height: bh,
        animation: "float 3s ease-in-out infinite",
        marginBottom: 16,
        zIndex: 2,
      }}>
        <div className="absolute overflow-hidden" style={{
          width: liqW,
          left: liqInset,
          top: liqTop,
          height: liqH,
          borderRadius: `0 0 ${Math.round(bw * 0.30)}px ${Math.round(bw * 0.30)}px`,
          zIndex: 1,
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
        <BottleGlass w={bw} h={bh} />
      </div>

      {/* Title */}
      <h1
        data-text="WATER SORT"
        className="bubble-title"
        style={{
          fontFamily: FONTS.orbitron,
          fontWeight: 900,
          fontSize: "clamp(1.8rem, 9vw, 2.6rem)",
          letterSpacing: "0.10em",
          lineHeight: 1.1,
          animation: "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        WATER SORT
      </h1>

      {/* Puzzle badge */}
      <div style={{
        fontFamily: FONTS.default,
        fontSize: "0.72rem",
        fontWeight: 700,
        color: "rgba(255,255,255,0.55)",
        letterSpacing: "0.28em",
        marginTop: 4,
        padding: "2px 12px",
        borderRadius: UI.radius.pill,
        background: UI.surface.base,
        border: UI.border.subtle,
      }}>
        PUZZLE
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2 mt-5">
        <div className="px-3 py-1 rounded-full" style={{
          background: "rgba(255,255,255,0.09)",
          border: "1px solid rgba(255,255,255,0.18)",
        }}>
          <span style={{
            fontFamily: FONTS.orbitron,
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
          }}>
            LEVEL {level}
          </span>
        </div>

        {totalStars > 0 && (
          <div className="px-3 py-1 rounded-full" style={{
            background: "rgba(255,200,60,0.12)",
            border: "1px solid rgba(255,200,60,0.25)",
          }}>
            <span style={{
              fontFamily: FONTS.default,
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#ffc83d",
            }}>
              ★ {totalStars}
            </span>
          </div>
        )}

        {streak > 0 && (
          <div className="px-3 py-1 rounded-full" style={{
            background: "rgba(255,100,0,0.12)",
            border: "1px solid rgba(255,100,0,0.20)",
          }}>
            <span style={{
              fontFamily: FONTS.default,
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#ff9040",
            }}>
              🔥 {streak}
            </span>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Play / Continue button */}
      <button
        onClick={onPlay}
        className="candy-btn active:scale-95"
        style={{
          width: 260,
          padding: "18px 0",
          borderRadius: UI.radius.pill,
          fontFamily: FONTS.orbitron,
          fontSize: "1.2rem",
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "0.12em",
          background: UI.accent.primaryGrad,
          boxShadow: `0 0 0 3px rgba(90,123,255,0.28), 0 8px 24px rgba(50,70,220,0.5), inset 0 2px 0 rgba(255,255,255,0.45)`,
          border: "2.5px solid rgba(255,255,255,0.75)",
          cursor: "pointer",
          minHeight: 58,
          animation: "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s both",
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
        opacity: 0.85,
      }}>
        {difficulty}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom nav — magenta ring orbs */}
      <div className="flex items-center gap-6">
        {navButtons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.fn}
            aria-label={btn.label}
            className="flex flex-col items-center gap-1.5 active:scale-90"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <div style={{
              width: 62,
              height: 62,
              borderRadius: "50%",
              background: UI.candy.ring,
              padding: 4,
              boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: UI.candy.inner,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
              }}>
                {btn.icon}
              </div>
            </div>
            <span style={{
              fontSize: "0.62rem",
              fontFamily: FONTS.default,
              fontWeight: 700,
              color: "rgba(255,255,255,0.80)",
              letterSpacing: "0.06em",
            }}>
              {btn.label}
            </span>
          </button>
        ))}
      </div>

      <Footer styleContent={{ padding: "10px 16px 0" }} />
    </div>
  );
}
