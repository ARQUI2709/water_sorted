// ============================================
// SETTINGS MODAL — difficulty, background, preferences
// ============================================

import React from 'react';
import { FONTS, BACKGROUNDS, UI, candy3d } from '../constants.js';
import { ModalCard } from '../components/chrome.jsx';

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: UI.font.sm, fontFamily: FONTS.default, fontWeight: 700,
      color: "rgba(140,220,255,0.90)", marginBottom: 8, textTransform: "uppercase",
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
    { key: 'easy',   label: 'EASY',   grad: "linear-gradient(180deg,#b8d8ff,#4ca8f5)", edge: "#1a5fb4", active: "#4ca8f5", desc: 'More empty bottles' },
    { key: 'normal', label: 'NORMAL', grad: "linear-gradient(180deg,#ffe27a,#ffab2e)", edge: "#c47600", active: "#ffd96a", desc: 'Balanced' },
    { key: 'hard',   label: 'HARD',   grad: "linear-gradient(180deg,#e9b8ff,#c06fef)", edge: "#7c22b4", active: "#c06fef", desc: 'Fewer empty bottles' },
  ];

  return (
    <ModalCard show={show} onClose={onClose} title="SETTINGS">
      {/* Difficulty */}
      <SectionLabel>Difficulty</SectionLabel>
      <div className="flex gap-2 mb-3">
        {tiers.map(t => {
          const active = difficulty === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChangeDifficulty(t.key)}
              aria-pressed={active}
              className="candy-btn flex-1 flex flex-col items-center py-3 active:scale-95"
              style={{
                background: active ? t.grad : "rgba(255,255,255,0.10)",
                border: active ? "2px solid rgba(255,255,255,0.50)" : "1.5px solid rgba(255,255,255,0.22)",
                borderRadius: UI.radius.md,
                transition: "all 0.15s ease",
                boxShadow: active ? candy3d(t.edge, 3) : "none",
                cursor: "pointer",
              }}
            >
              <span style={{
                fontFamily: FONTS.orbitron,
                fontSize: UI.font.sm,
                fontWeight: 700,
                color: active ? "#fff" : UI.text.secondary,
                textShadow: active ? "0 1px 0 rgba(0,0,0,0.25)" : "none",
              }}>
                {t.label}
              </span>
              <span style={{
                fontSize: UI.font.xs,
                fontFamily: FONTS.default,
                color: active ? "rgba(255,255,255,0.75)" : UI.text.muted,
                marginTop: 3,
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
      <div className="grid grid-cols-3 gap-2 mb-5">
        {BACKGROUNDS.map(bg => {
          const active = backgroundId === bg.id;
          return (
            <button
              key={bg.id}
              onClick={() => onChangeBackground(bg.id)}
              aria-pressed={active}
              className="active:scale-95 text-center flex flex-col items-center justify-center gap-2"
              style={{
                background: active ? UI.surface.active : "rgba(255,255,255,0.08)",
                border: active ? "2px solid rgba(100,200,255,0.55)" : "1.5px solid rgba(255,255,255,0.18)",
                borderRadius: UI.radius.md,
                transition: "all 0.15s ease",
                boxShadow: active ? "0 0 12px rgba(80,160,255,0.35)" : "none",
                cursor: "pointer",
                padding: "12px 6px",
                minHeight: 76,
              }}
            >
              <div style={{
                fontFamily: FONTS.default,
                fontSize: UI.font.sm,
                fontWeight: 700,
                color: active ? "#fff" : UI.text.secondary,
              }}>
                {bg.name}
              </div>
              <span style={{ fontSize: "2rem", lineHeight: 1 }}>{bg.icon}</span>
            </button>
          );
        })}
      </div>

      {/* Preferences */}
      <SectionLabel>Preferences</SectionLabel>
      <ToggleRow icon="🔊" label="Sound" on={!muted} onToggle={onToggleMuted} />
      <ToggleRow icon="◑" label="Colorblind patterns" on={patMode} onToggle={onTogglePatMode} />

      <div style={{ height: 8 }} />

      {/* Achievements + How to Play — side by side */}
      <div className="flex gap-2 mb-2">
        {onOpenAchievements && (
          <button
            onClick={onOpenAchievements}
            className="candy-btn flex-1 py-2.5 font-bold active:scale-95 flex items-center justify-center gap-1.5"
            style={{
              background: UI.candy.button.green.grad,
              border: "2px solid rgba(255,255,255,0.45)",
              color: "#fff",
              fontSize: UI.font.sm,
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
            className="candy-btn flex-1 py-2.5 font-bold active:scale-95 flex items-center justify-center gap-1.5"
            style={{
              background: UI.candy.button.blue.grad,
              border: "2px solid rgba(255,255,255,0.45)",
              color: "#fff",
              fontSize: UI.font.sm,
              fontFamily: FONTS.orbitron,
              borderRadius: UI.radius.pill,
              boxShadow: candy3d(UI.candy.button.blue.edge, 3),
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ❓ How to Play
          </button>
        )}
      </div>

    </ModalCard>
  );
}
