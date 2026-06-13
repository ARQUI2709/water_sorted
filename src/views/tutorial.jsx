// ============================================
// TUTORIAL — first-time "how to play" overlay
// ============================================

import React from 'react';
import { FONTS, UI, MAIN_COLORS, candy3d } from '../constants.js';
import { ModalCard } from '../components/chrome.jsx';

// Tiny decorative bottle used in step illustrations
function MiniBottle({ slices, highlight }) {
  return (
    <div style={{
      width: 30,
      height: 80,
      border: "2.5px solid rgba(255,255,255,0.55)",
      borderTop: "none",
      borderRadius: "0 0 12px 12px",
      display: "flex",
      flexDirection: "column-reverse",
      overflow: "hidden",
      boxShadow: highlight ? "0 0 12px rgba(255,255,255,0.45)" : "none",
      position: "relative",
    }}>
      {slices.map((color, i) => (
        <div key={i} style={{ height: 18, backgroundColor: color || "transparent" }} />
      ))}
      {/* Gloss stripe */}
      <div style={{
        position: "absolute",
        top: 4, left: 4,
        width: 4, height: "60%",
        background: "rgba(255,255,255,0.30)",
        borderRadius: 2,
        pointerEvents: "none",
      }} />
    </div>
  );
}

const RED = MAIN_COLORS[0];
const BLUE = MAIN_COLORS[2];

const STEPS = [
  {
    title: "TAP TO POUR",
    body: "Tap a bottle to pick it up, then tap another bottle to pour. You can only pour onto the same color or into an empty bottle.",
    art: (
      <div className="flex items-end justify-center gap-4">
        <MiniBottle slices={[BLUE, RED, RED]} highlight />
        <span style={{ color: UI.text.secondary, fontSize: "1.3rem" }}>→</span>
        <MiniBottle slices={[RED]} />
      </div>
    ),
  },
  {
    title: "SORT TO WIN",
    body: "Fill each bottle with a single color to complete it. Sort every color to win the level.",
    art: (
      <div className="flex items-end justify-center gap-4">
        <MiniBottle slices={[RED, RED, RED, RED]} highlight />
        <span style={{ color: "#3fd68f", fontSize: "1.5rem" }}>✓</span>
        <MiniBottle slices={[BLUE, BLUE, BLUE, BLUE]} highlight />
      </div>
    ),
  },
  {
    title: "STARS & HELPERS",
    body: "Fewer moves earn more stars (up to ★★★). Undo and hints are limited per level. Higher levels hide some colors behind a ? until you uncover them.",
    art: (
      <div className="flex items-center justify-center gap-2" style={{ fontSize: "1.5rem" }}>
        <span style={{ color: UI.accent.gold }}>★★★</span>
        <span style={{ color: UI.text.secondary, fontSize: "1.2rem" }}>· ↶ · ?</span>
      </div>
    ),
  },
];

export function Tutorial({ show, onClose }) {
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (show) setStep(0);
  }, [show]);

  if (!show) return null;

  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  return (
    <ModalCard show={show} onClose={onClose} title="HOW TO PLAY" showClose={false} backdropClose={false}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-4" style={{ minHeight: 90 }}>
          {s.art}
        </div>

        <div className="font-bold mb-2" style={{
          fontFamily: FONTS.orbitron,
          fontSize: UI.font.md,
          color: UI.accent.gold,
          textShadow: "0 2px 0 rgba(140,80,0,0.4)",
        }}>
          {s.title}
        </div>

        <p style={{
          fontFamily: FONTS.default,
          fontSize: UI.font.md,
          color: UI.text.secondary,
          lineHeight: 1.45,
          minHeight: 72,
        }}>
          {s.body}
        </p>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 my-4">
          {STEPS.map((_, i) => (
            <span key={i} className="rounded-full" style={{
              width: 8, height: 8,
              background: i === step
                ? "linear-gradient(135deg,#34d2f7,#9b5cf6)"
                : "rgba(255,255,255,0.15)",
              boxShadow: i === step ? "0 0 6px rgba(100,180,255,0.6)" : "none",
              transition: "background 0.2s",
            }} />
          ))}
        </div>

        <button
          onClick={() => last ? onClose() : setStep(n => n + 1)}
          className="candy-btn w-full py-3 font-bold text-white active:scale-95"
          style={{
            fontFamily: FONTS.orbitron,
            fontSize: UI.font.md,
            background: UI.accent.primaryGrad,
            boxShadow: candy3d("#3346c4", 4),
            letterSpacing: "0.1em",
            minHeight: 48,
            borderRadius: UI.radius.pill,
            border: "2px solid rgba(255,255,255,0.60)",
            cursor: "pointer",
          }}
        >
          {last ? "GOT IT!" : "NEXT →"}
        </button>

        {!last && (
          <button
            onClick={onClose}
            className="w-full py-2 mt-1 active:scale-95"
            style={{
              fontFamily: FONTS.default,
              fontSize: UI.font.sm,
              color: UI.text.muted,
              background: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Skip
          </button>
        )}
      </div>
    </ModalCard>
  );
}
