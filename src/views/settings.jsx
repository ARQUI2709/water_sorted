// ============================================
// SETTINGS MODAL — difficulty, background, preferences
// ============================================

import React from 'react';
import { FONTS, BACKGROUNDS, UI, candy3d } from '../constants.js';
import { ModalCard } from '../components/chrome.jsx';

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: UI.font.xs, fontFamily: FONTS.default, fontWeight: 700,
      color: UI.text.muted, marginBottom: 8, textTransform: "uppercase",
      letterSpacing: "0.08em",
    }}>
      {children}
    </div>
  );
}

function ToggleRow({ icon, label, on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      className="w-full flex items-center justify-between py-2.5 px-3 mb-2 active:scale-95"
      style={{
        background: UI.surface.base,
        border: UI.border.subtle,
        borderRadius: UI.radius.md,
        transition: "all 0.15s ease",
        cursor: "pointer",
      }}
    >
      <span style={{
        fontFamily: FONTS.default, fontSize: UI.font.md, fontWeight: 600,
        color: UI.text.secondary,
      }}>
        {icon} {label}
      </span>
      {/* Sliding switch */}
      <div style={{
        width: 40, height: 22,
        borderRadius: UI.radius.pill,
        background: on ? "linear-gradient(90deg,#3fd68f,#2fc764)" : "rgba(255,255,255,0.12)",
        border: on ? "1.5px solid rgba(0,0,0,0.15)" : "1.5px solid rgba(255,255,255,0.18)",
        position: "relative",
        transition: "background 0.2s",
        boxShadow: on ? "inset 0 1px 0 rgba(0,0,0,0.1)" : "none",
        flexShrink: 0,
      }}>
        <div style={{
          position: "absolute",
          top: 2, left: on ? 20 : 2,
          width: 16, height: 16,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
          transition: "left 0.2s ease",
        }} />
      </div>
    </button>
  );
}

export function SettingsModal({
  show, onClose,
  difficulty, onChangeDifficulty,
  backgroundId, onChangeBackground,
  muted, onToggleMuted,
  patMode, onTogglePatMode,
  onOpenAchievements, onOpenTutorial,
}) {
  const tiers = [
    { key: 'easy',   label: 'EASY',   grad: "linear-gradient(180deg,#a9f5cd,#3fd68f)", edge: "#0f8f60", active: "#3fd68f", desc: 'More empty bottles' },
    { key: 'normal', label: 'NORMAL', grad: "linear-gradient(180deg,#ffe27a,#ffab2e)", edge: "#c47600", active: "#ffd96a", desc: 'Balanced' },
    { key: 'hard',   label: 'HARD',   grad: "linear-gradient(180deg,#ffbada,#ff6fae)", edge: "#c23577", active: "#ff6fae", desc: 'Fewer empty bottles' },
  ];

  return (
    <ModalCard show={show} onClose={onClose} title="SETTINGS">
      {/* Difficulty */}
      <SectionLabel>Difficulty</SectionLabel>
      <div className="flex gap-2 mb-2">
        {tiers.map(t => {
          const active = difficulty === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChangeDifficulty(t.key)}
              aria-pressed={active}
              className="candy-btn flex-1 flex flex-col items-center py-2 active:scale-95"
              style={{
                background: active ? t.grad : UI.surface.base,
                border: active ? "2px solid rgba(255,255,255,0.50)" : UI.border.subtle,
                borderRadius: UI.radius.md,
                transition: "all 0.15s ease",
                boxShadow: active ? candy3d(t.edge, 3) : "none",
                cursor: "pointer",
              }}
            >
              <span style={{
                fontFamily: FONTS.orbitron,
                fontSize: UI.font.xs,
                fontWeight: 700,
                color: active ? "#fff" : UI.text.muted,
                textShadow: active ? "0 1px 0 rgba(0,0,0,0.25)" : "none",
              }}>
                {t.label}
              </span>
              <span style={{
                fontSize: UI.font.xs,
                fontFamily: FONTS.default,
                color: active ? "rgba(255,255,255,0.75)" : UI.text.muted,
                marginTop: 2,
              }}>
                {t.desc}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{
        fontSize: UI.font.xs, fontFamily: FONTS.default,
        color: UI.text.muted, marginBottom: 16,
      }}>
        Applies from the next level — the current level keeps its layout.
      </div>

      {/* Background */}
      <SectionLabel>Background</SectionLabel>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {BACKGROUNDS.map(bg => {
          const active = backgroundId === bg.id;
          return (
            <button
              key={bg.id}
              onClick={() => onChangeBackground(bg.id)}
              aria-pressed={active}
              className="py-2 active:scale-95 text-center flex flex-col items-center gap-1"
              style={{
                background: active ? UI.surface.active : UI.surface.base,
                border: active ? "2px solid rgba(100,200,255,0.55)" : UI.border.subtle,
                borderRadius: UI.radius.md,
                transition: "all 0.15s ease",
                boxShadow: active ? "0 0 10px rgba(80,160,255,0.30)" : "none",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{bg.icon}</span>
              <div style={{
                fontFamily: FONTS.default,
                fontSize: UI.font.xs,
                fontWeight: 700,
                color: active ? "#fff" : UI.text.muted,
              }}>
                {bg.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Preferences */}
      <SectionLabel>Preferences</SectionLabel>
      <ToggleRow icon="🔊" label="Sound" on={!muted} onToggle={onToggleMuted} />
      <ToggleRow icon="◑" label="Colorblind patterns" on={patMode} onToggle={onTogglePatMode} />

      <div style={{ height: 8 }} />

      {onOpenAchievements && (
        <button
          onClick={onOpenAchievements}
          className="candy-btn w-full py-2.5 font-bold active:scale-95 mb-2 flex items-center justify-center gap-2"
          style={{
            background: UI.candy.button.green.grad,
            border: "2px solid rgba(255,255,255,0.45)",
            color: "#fff",
            fontSize: UI.font.md,
            fontFamily: FONTS.orbitron,
            borderRadius: UI.radius.pill,
            boxShadow: candy3d(UI.candy.button.green.edge, 3),
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          🏆 Achievements
        </button>
      )}

      {onOpenTutorial && (
        <button
          onClick={onOpenTutorial}
          className="candy-btn w-full py-2.5 font-bold active:scale-95 mb-2 flex items-center justify-center gap-2"
          style={{
            background: UI.candy.button.blue.grad,
            border: "2px solid rgba(255,255,255,0.45)",
            color: "#fff",
            fontSize: UI.font.md,
            fontFamily: FONTS.orbitron,
            borderRadius: UI.radius.pill,
            boxShadow: candy3d(UI.candy.button.blue.edge, 3),
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ❓ How to play
        </button>
      )}
    </ModalCard>
  );
}
