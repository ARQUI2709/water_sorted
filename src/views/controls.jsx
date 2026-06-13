// ============================================
// BOTTOM CONTROLS — action button bar (footer)
// ============================================

import React from 'react';
import { FONTS, UI, candy3d } from '../constants.js';

const CANDY_MAP = { UNDO: 'peach', HINT: 'mint', RETRY: 'pink', SKIP: 'lavender', ADD: 'sky' };

export function BottomControls({ controls }) {
  return (
    <div className="shrink-0 px-2 pb-1.5" style={{
      position: "relative",
      zIndex: UI.z.chrome,
      paddingBottom: "max(6px, env(safe-area-inset-bottom, 6px))",
    }}>
      <div className="flex justify-center gap-2 mx-auto">
        {controls.map((btn, i) => {
          const ck = CANDY_MAP[btn.label] || 'sky';
          const ct = UI.candy.button[ck];
          return (
            <button
              key={i}
              onClick={btn.fn}
              disabled={btn.dis}
              aria-label={btn.label}
              className="candy-btn relative flex-1 flex flex-col items-center justify-center active:scale-90"
              style={{
                background: ct.grad,
                border: "2px solid rgba(255,255,255,0.55)",
                borderRadius: 18,
                minHeight: 64,
                maxWidth: 80,
                gap: 4,
                cursor: btn.dis ? "not-allowed" : "pointer",
                opacity: btn.dis ? 0.35 : 1,
                color: "#fff",
                transition: "transform 0.1s",
                boxShadow: candy3d(ct.edge),
                filter: btn.dis ? "saturate(0.4)" : "none",
                animation: btn.pending ? "pulse 1s ease-in-out infinite" : "none",
              }}
            >
              <span className="flex items-center justify-center" style={{ lineHeight: 0, filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.25))" }}>
                {btn.icon}
              </span>
              <span style={{
                fontSize: "0.58rem",
                fontFamily: FONTS.default,
                fontWeight: 800,
                color: "#fff",
                textShadow: "0 1px 0 rgba(0,0,0,0.30)",
                letterSpacing: "0.05em",
                lineHeight: 1,
              }}>
                {btn.label}
              </span>

              {/* Count badge */}
              {btn.count != null && btn.count !== Infinity && (
                <span
                  className="absolute flex items-center justify-center"
                  style={{
                    top: -6, right: -6,
                    minWidth: 20, height: 20,
                    padding: "0 5px",
                    borderRadius: UI.radius.pill,
                    background: btn.count > 0 ? "#fff" : "rgba(255,255,255,0.25)",
                    color: btn.count > 0 ? (ct.text || "#333") : "rgba(255,255,255,0.7)",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    fontFamily: FONTS.default,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.30)",
                    border: "1.5px solid rgba(255,255,255,0.5)",
                    lineHeight: 1,
                  }}
                >
                  ×{btn.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
