// ============================================
// SETTINGS MODAL — gear menu with difficulty
// ============================================

function SettingsModal({
  show, onClose,
  difficulty, onChangeDifficulty,
  backgroundId, onChangeBackground,
  onOpenAchievements
}) {
  if (!show) return null;

  const tiers = [
    { key: 'easy', label: 'EASY', color: '#4ade80', desc: 'More empty bottles' },
    { key: 'normal', label: 'NORMAL', color: '#facc15', desc: 'Balanced' },
    { key: 'hard', label: 'HARD', color: '#f87171', desc: 'Fewer empty bottles' },
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-6"
      style={{ zIndex: 70, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="p-5 rounded-2xl w-full max-w-xs"
        style={{
          background: "linear-gradient(160deg, rgba(30,20,60,0.97), rgba(20,15,45,0.97))",
          border: "1px solid rgba(255,255,255,0.12)",
          animation: "bounceIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-bold text-center mb-4" style={{
          fontFamily: FONTS.orbitron,
          fontSize: "1rem",
          color: "rgba(255,255,255,0.85)",
        }}>
          SETTINGS
        </h3>

        {/* Difficulty Section */}
        <div style={{
          fontSize: "0.7rem", fontFamily: FONTS.default, fontWeight: 600,
          color: "rgba(255,255,255,0.45)", marginBottom: 8, textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Difficulty
        </div>

        <div className="flex gap-2 mb-6">
          {tiers.map(t => {
            const active = difficulty === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onChangeDifficulty(t.key)}
                className="flex-1 flex flex-col items-center py-2.5 rounded-xl active:scale-95"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${t.color}22, ${t.color}11)`
                    : "rgba(255,255,255,0.05)",
                  border: active
                    ? `2px solid ${t.color}88`
                    : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{
                  fontFamily: FONTS.orbitron,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: active ? t.color : "rgba(255,255,255,0.5)",
                }}>
                  {t.label}
                </span>
                <span style={{
                  fontSize: "0.55rem",
                  fontFamily: FONTS.default,
                  color: active ? `${t.color}aa` : "rgba(255,255,255,0.25)",
                  marginTop: 2,
                }}>
                  {t.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Background Section */}
        <div style={{
          fontSize: "0.7rem", fontFamily: FONTS.default, fontWeight: 600,
          color: "rgba(255,255,255,0.45)", marginBottom: 8, textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Background
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {BACKGROUNDS.map(bg => {
            const active = backgroundId === bg.id;
            return (
              <button
                key={bg.id}
                onClick={() => onChangeBackground(bg.id)}
                className="py-2.5 rounded-xl active:scale-95 text-center"
                style={{
                  background: active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                  border: active ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{
                  fontFamily: FONTS.default,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                }}>
                  {bg.name}
                </div>
              </button>
            );
          })}
        </div>

        {onOpenAchievements && (
          <button
            onClick={onOpenAchievements}
            className="w-full py-2.5 rounded-xl font-semibold active:scale-95 mb-2 flex items-center justify-center gap-2"
            style={{
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.15)",
              color: "#fbbf24",
              fontSize: "0.85rem",
              fontFamily: FONTS.orbitron,
            }}
          >
            🏆 Achievements
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-semibold active:scale-95"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.85rem",
            fontFamily: FONTS.default,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
