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
  const diffColor = difficulty === 'easy' ? '#3fd68f' : difficulty === 'hard' ? '#ff6fae' : '#ffd96a';
  const hiddenLabel = hiddenCount === 0 ? null : hiddenCount >= 3 ? "TOP" : `H${hiddenCount}`;

  const chipStyle = {
    background: "rgba(8,12,44,0.75)",
    border: "1.5px solid rgba(255,255,255,0.20)",
    borderRadius: UI.radius.pill,
    color: UI.text.secondary,
    fontSize: UI.font.sm,
    fontFamily: FONTS.default,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    padding: "3px 10px",
  };

  const statusParts = [`${moves} mv`];
  if (bestStars > 0) statusParts.push("★".repeat(bestStars) + "☆".repeat(3 - bestStars));
  else if (best > 0) statusParts.push(`★${best}`);
  if (streak > 1) statusParts.push(`🔥${streak}`);

  return (
    <div className="w-full px-3 pt-2 pb-1 shrink-0" style={{ position: "relative", zIndex: UI.z.chrome }}>
      <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto" style={{ height: 62 }}>

        {/* Left: level chip + status chip */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onOpenMap}
            aria-label={`Level ${level} — open level map`}
            className="active:scale-95 shrink-0 flex items-center gap-1"
            style={{ ...chipStyle, cursor: "pointer", transition: "transform 0.15s" }}
          >
            <span style={{ fontSize: "0.9rem" }}>🪐</span>
            <span className="font-black" style={{
              fontFamily: FONTS.orbitron, fontSize: UI.font.lg,
              color: "#fff",
            }}>
              LV{level}
            </span>
            <span style={{ color: UI.text.muted, fontSize: UI.font.xs, lineHeight: 1 }}>▸</span>
          </button>

          <span style={{ ...chipStyle, overflow: "hidden", textOverflow: "ellipsis" }}>
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
              boxShadow: `0 0 6px ${diffColor}88`,
              display: "inline-block",
            }}
          />

          {hiddenLabel && (
            <span className="shrink-0" style={{
              ...chipStyle,
              background: "rgba(255,0,110,0.18)", color: "#ff6b9d",
              border: "1px solid rgba(255,0,110,0.28)",
              animation: "pulse 2s infinite",
            }}>
              🔒{hiddenLabel}
            </span>
          )}
        </div>

        {/* Right: settings gear + timer chip + progress ring */}
        <div className="flex items-center gap-2 shrink-0">
          <IconButton icon="⚙" ariaLabel="Settings" onClick={onOpenSettings} size={34} />

          {/* Timer chip — fixed width prevents reflow on digit change */}
          <span style={{
            ...chipStyle,
            fontFamily: FONTS.orbitron,
            fontSize: UI.font.sm,
            minWidth: "5.5ch",
            textAlign: "right",
            display: "inline-block",
          }}>
            ⏱ {time}
          </span>

          <div className="relative" style={{ width: 32, height: 32 }}>
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
              <circle
                cx="16" cy="16" r="13" fill="none" stroke={UI.accent.gold} strokeWidth="2.5"
                strokeDasharray={`${(doneCount / Math.max(1, numColors)) * 81.7} 81.7`}
                strokeLinecap="round" transform="rotate(-90 16 16)"
                style={{ transition: "stroke-dasharray 0.4s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center" style={{
              fontSize: "0.6rem", fontWeight: 700,
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
