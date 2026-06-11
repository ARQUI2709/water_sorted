// ============================================
// BOTTOM CONTROLS — action button bar (footer)
// ============================================

import React from 'react';
import { FONTS, UI } from '../constants.js';

export function BottomControls({ controls }) {
  return (
    <div className="shrink-0 px-2 pb-1.5" style={{
      position: "relative", zIndex: UI.z.chrome,
      paddingBottom: "max(6px, env(safe-area-inset-bottom, 6px))",
    }}>
      <div className="flex justify-center gap-2 max-w-md mx-auto">
        {controls.map((btn, i) => (
          <button
            key={i}
            onClick={btn.fn}
            disabled={btn.dis}
            aria-label={btn.label}
            className="relative flex-1 flex flex-col items-center justify-center active:scale-90"
            style={{
              background: UI.surface.base,
              border: UI.border.subtle,
              borderRadius: UI.radius.md,
              minHeight: 52,
              maxWidth: 80,
              cursor: btn.dis ? "not-allowed" : "pointer",
              opacity: btn.dis ? 0.35 : 1,
              transition: "transform 0.1s, background 0.15s",
            }}
          >
            <span style={{
              fontSize: "1.2rem", lineHeight: 1, color: UI.text.primary, fontWeight: 700,
              animation: btn.pending ? "pulse 1s ease-in-out infinite" : "none",
            }}>
              {btn.icon}
            </span>
            <span style={{
              fontSize: UI.font.xs, color: UI.text.secondary,
              fontFamily: FONTS.default, fontWeight: 700, marginTop: 2, letterSpacing: "0.03em",
            }}>
              {btn.label}
            </span>

            {/* Remaining-count corner badge */}
            {btn.count != null && btn.count !== Infinity && (
              <span
                className="absolute flex items-center justify-center"
                style={{
                  top: -5, right: -5,
                  minWidth: 18, height: 18,
                  padding: "0 4px",
                  borderRadius: UI.radius.pill,
                  background: btn.count > 0 ? UI.accent.primaryGrad : "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  fontFamily: FONTS.default,
                  border: "1px solid rgba(0,0,0,0.3)",
                }}
              >
                ×{btn.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
