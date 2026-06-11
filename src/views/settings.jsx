// ============================================
// SETTINGS MODAL — difficulty, background, preferences
// ============================================

import React from 'react';
import { FONTS, BACKGROUNDS, UI } from '../constants.js';
import { ModalCard } from '../components/chrome.jsx';

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: UI.font.xs, fontFamily: FONTS.default, fontWeight: 600,
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
      <span style={{
        fontFamily: FONTS.default, fontSize: UI.font.xs, fontWeight: 700,
        padding: "2px 10px",
        borderRadius: UI.radius.pill,
        background: on ? "rgba(74,222,128,0.15)" : UI.surface.base,
        border: on ? "1px solid rgba(74,222,128,0.4)" : UI.border.subtle,
        color: on ? "#4ade80" : UI.text.muted,
      }}>
        {on ? "ON" : "OFF"}
      </span>
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
    { key: 'easy', label: 'EASY', color: '#4ade80', desc: 'More empty bottles' },
    { key: 'normal', label: 'NORMAL', color: '#facc15', desc: 'Balanced' },
    { key: 'hard', label: 'HARD', color: '#f87171', desc: 'Fewer empty bottles' },
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
              className="flex-1 flex flex-col items-center py-2.5 active:scale-95"
              style={{
                background: active
                  ? `linear-gradient(135deg, ${t.color}22, ${t.color}11)`
                  : UI.surface.base,
                border: active
                  ? `2px solid ${t.color}88`
                  : UI.border.subtle,
                borderRadius: UI.radius.md,
                transition: "all 0.15s ease",
              }}
            >
              <span style={{
                fontFamily: FONTS.orbitron,
                fontSize: UI.font.xs,
                fontWeight: 700,
                color: active ? t.color : UI.text.muted,
              }}>
                {t.label}
              </span>
              <span style={{
                fontSize: UI.font.xs,
                fontFamily: FONTS.default,
                color: active ? `${t.color}aa` : UI.text.muted,
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
              className="py-2.5 active:scale-95 text-center"
              style={{
                background: active ? UI.surface.active : UI.surface.base,
                border: active ? UI.border.strong : UI.border.subtle,
                borderRadius: UI.radius.md,
                transition: "all 0.15s ease",
              }}
            >
              <div style={{
                fontFamily: FONTS.default,
                fontSize: UI.font.xs,
                fontWeight: 600,
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
          className="w-full py-2.5 font-semibold active:scale-95 mb-2 flex items-center justify-center gap-2"
          style={{
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.15)",
            color: UI.accent.gold,
            fontSize: UI.font.md,
            fontFamily: FONTS.orbitron,
            borderRadius: UI.radius.md,
          }}
        >
          🏆 Achievements
        </button>
      )}

      {onOpenTutorial && (
        <button
          onClick={onOpenTutorial}
          className="w-full py-2.5 font-semibold active:scale-95 mb-2 flex items-center justify-center gap-2"
          style={{
            background: UI.surface.base,
            border: UI.border.subtle,
            color: UI.text.secondary,
            fontSize: UI.font.md,
            fontFamily: FONTS.orbitron,
            borderRadius: UI.radius.md,
          }}
        >
          ❓ How to play
        </button>
      )}
    </ModalCard>
  );
}
