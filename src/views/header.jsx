// ============================================
// HEADER — top bar with level info + controls
// ============================================

import React from 'react';
import { FONTS, UI } from '../constants.js';
import { IconButton } from '../components/chrome.jsx';

export function Header({
  level, moves, bestStars, best, streak,
  difficulty, hiddenCount, time,
  doneCount, numColors,
  onOpenMap, onOpenSettings,
}) {
  const diffColor = difficulty === 'easy' ? '#4ade80' : difficulty === 'hard' ? '#f87171' : '#facc15';
  const hiddenLabel = hiddenCount === 0 ? null : hiddenCount >= 3 ? "TOP" : `H${hiddenCount}`;

  // One combined status string instead of a wrapping row of pills.
  const statusParts = [`${moves} mv`];
  if (bestStars > 0) statusParts.push("★".repeat(bestStars) + "☆".repeat(3 - bestStars));
  else if (best > 0) statusParts.push(`★${best}`);
  if (streak > 1) statusParts.push(`🔥${streak}`);

  return (
    <div className="w-full px-3 pt-2 pb-1 shrink-0" style={{ position: "relative", zIndex: UI.z.chrome }}>
      <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto" style={{ height: 44 }}>

        {/* Left: level pill + combined status */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onOpenMap}
            aria-label={`Level ${level} — open level map`}
            className="active:scale-95 shrink-0 px-2.5 py-1 flex items-center gap-1"
            style={{
              background: UI.surface.base,
              border: UI.border.subtle,
              borderRadius: UI.radius.pill,
              cursor: "pointer",
              transition: "transform 0.15s, background 0.15s",
            }}
          >
            <span className="font-black" style={{
              fontFamily: FONTS.orbitron, fontSize: UI.font.lg,
              background: UI.titleGrad,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              LV{level}
            </span>
            <span style={{ color: UI.text.muted, fontSize: UI.font.sm, lineHeight: 1 }}>▸</span>
          </button>

          <span
            className="px-2.5 py-1 min-w-0"
            style={{
              background: UI.surface.base,
              border: UI.border.subtle,
              borderRadius: UI.radius.pill,
              color: UI.text.secondary,
              fontSize: UI.font.sm,
              fontFamily: FONTS.default,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {statusParts.join(" · ")}
          </span>

          {/* Difficulty dot */}
          <span
            title={difficulty}
            aria-label={`Difficulty: ${difficulty}`}
            className="shrink-0 rounded-full"
            style={{
              width: 10, height: 10,
              backgroundColor: diffColor,
              boxShadow: `0 0 5px ${diffColor}66`,
              display: "inline-block",
            }}
          />

          {hiddenLabel && (
            <span className="shrink-0 px-1.5 py-0.5" style={{
              background: "rgba(255,0,110,0.15)", color: "#FF006E",
              border: "1px solid rgba(255,0,110,0.2)", fontSize: UI.font.xs,
              borderRadius: UI.radius.pill,
              fontWeight: 700, fontFamily: FONTS.default, animation: "pulse 2s infinite",
              whiteSpace: "nowrap",
            }}>
              🔒{hiddenLabel}
            </span>
          )}
        </div>

        {/* Right: settings gear + timer + progress ring */}
        <div className="flex items-center gap-2 shrink-0">
          <IconButton icon="⚙" ariaLabel="Settings" onClick={onOpenSettings} size={36} />

          {/* Fixed width + tabular digits: Orbitron digits vary in width, and
              a ticking clock that resizes every second would reflow the
              header (and the board below it). */}
          <span style={{
            fontFamily: FONTS.orbitron, fontSize: UI.font.sm,
            color: UI.text.secondary, letterSpacing: "0.05em",
            fontVariantNumeric: "tabular-nums",
            minWidth: "5ch", textAlign: "right", display: "inline-block",
          }}>
            {time}
          </span>

          <div className="relative" style={{ width: 32, height: 32 }}>
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
              <circle
                cx="16" cy="16" r="13" fill="none" stroke={UI.accent.primary} strokeWidth="2.5"
                strokeDasharray={`${(doneCount / Math.max(1, numColors)) * 81.7} 81.7`}
                strokeLinecap="round" transform="rotate(-90 16 16)"
                style={{ transition: "stroke-dasharray 0.4s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center" style={{
              fontSize: UI.font.xs, fontWeight: 700,
              color: UI.text.secondary, fontFamily: FONTS.default,
            }}>
              {doneCount}/{numColors}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
