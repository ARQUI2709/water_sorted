// ============================================
// TUTORIAL — first-time "how to play" overlay
// ============================================

import React from 'react';
import { FONTS, UI, MAIN_COLORS, candy3d } from '../constants.js';
import { ModalCard } from '../components/chrome.jsx';

const BOTTLE_BODY = "M23,16 L18,30 C10,42 9,50 9,60 L9,106 Q9,122 32,122 Q55,122 55,106 L55,60 C55,50 54,42 46,30 L41,16 Z";
const INTERIOR_BOTTOM = 122;
const INTERIOR_HEIGHT = 106; // y=16 to y=122

function TutorialBottle({ slices = [], capacity = 4, id, highlight }) {
  const clipId = `tcb-${id}`;
  const glossId = `tcg-${id}`;
  const sliceH = INTERIOR_HEIGHT / capacity;

  return (
    <svg width="64" height="132" viewBox="0 0 64 132" style={{
      filter: highlight ? "drop-shadow(0 0 12px rgba(255,255,255,0.45))" : "none",
    }}>
      <defs>
        <clipPath id={clipId}>
          <path d={BOTTLE_BODY} />
        </clipPath>
        <linearGradient id={glossId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(255,255,255,0.28)" />
          <stop offset="0.4" stopColor="rgba(255,255,255,0.07)" />
          <stop offset="1" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>

      {/* Liquid slices — slices[0] is the bottom-most */}
      {slices.map((color, i) => (
        <rect
          key={i}
          x={0} y={INTERIOR_BOTTOM - (i + 1) * sliceH}
          width={64} height={sliceH}
          fill={color || "transparent"}
          clipPath={`url(#${clipId})`}
        />
      ))}

      {/* Glass gloss */}
      <rect x={0} y={0} width={64} height={132}
        fill={`url(#${glossId})`} clipPath={`url(#${clipId})`} />

      {/* Bottle body outline */}
      <path d={BOTTLE_BODY} fill="none"
        stroke="rgba(255,255,255,0.60)" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Neck */}
      <rect x="22" y="2" width="20" height="16" rx="4"
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(255,255,255,0.60)" strokeWidth="2.5" />
    </svg>
  );
}

const RED = MAIN_COLORS[0];
const BLUE = MAIN_COLORS[2];

const STEPS = [
  {
    title: "TOCA PARA VERTER",
    body: "Toca una botella para seleccionarla, luego toca otra para verter. Solo puedes verter sobre el mismo color o en una botella vacía.",
    art: (
      <div className="flex items-center justify-center gap-4">
        <TutorialBottle slices={[BLUE, RED, RED]} id="s1a" highlight />
        <span style={{ color: UI.text.secondary, fontSize: "1.6rem" }}>→</span>
        <TutorialBottle slices={[RED]} id="s1b" />
      </div>
    ),
  },
  {
    title: "ORDENAR PARA GANAR",
    body: "Llena cada botella con un solo color para completarla. Ordena cada color para ganar el nivel.",
    art: (
      <div className="flex items-center justify-center gap-4">
        <TutorialBottle slices={[RED, RED, RED, RED]} id="s2a" highlight />
        <span style={{ color: "#3fd68f", fontSize: "2rem" }}>✓</span>
        <TutorialBottle slices={[BLUE, BLUE, BLUE, BLUE]} id="s2b" highlight />
      </div>
    ),
  },
  {
    title: "ESTRELLAS Y AYUDAS",
    body: "Menos movimientos dan más estrellas (hasta ★★★). Deshacer y pistas son limitados. En niveles avanzados, algunos colores están ocultos tras ? hasta que los descubres.",
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
    <ModalCard show={show} onClose={onClose} title="CÓMO JUGAR" showClose={false} backdropClose={false}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-4" style={{ minHeight: 140 }}>
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
          {last ? "¡ENTENDIDO!" : "SIGUIENTE →"}
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
            Saltar
          </button>
        )}
      </div>
    </ModalCard>
  );
}
