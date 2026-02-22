// ============================================
// ACHIEVEMENTS — track player milestones
// ============================================

// Achievement definitions
const ACHIEVEMENTS = [
  { id: 'first_win',    icon: '🏆', title: 'First Victory',     desc: 'Complete your first level',          check: (s) => s.totalWins >= 1 },
  { id: 'streak_5',     icon: '🔥', title: 'On Fire',           desc: 'Win 5 levels in a row',             check: (s) => s.bestStreak >= 5 },
  { id: 'streak_10',    icon: '💥', title: 'Unstoppable',       desc: 'Win 10 levels in a row',            check: (s) => s.bestStreak >= 10 },
  { id: 'stars_3',      icon: '⭐', title: 'Perfectionist',     desc: 'Get 3 stars on any level',          check: (s) => s.threeStarCount >= 1 },
  { id: 'stars_10',     icon: '🌟', title: 'Star Collector',    desc: 'Get 3 stars on 10 levels',          check: (s) => s.threeStarCount >= 10 },
  { id: 'level_10',     icon: '📈', title: 'Rising Up',         desc: 'Reach level 10',                    check: (s) => s.highestLevel >= 10 },
  { id: 'level_25',     icon: '🚀', title: 'Soaring High',      desc: 'Reach level 25',                    check: (s) => s.highestLevel >= 25 },
  { id: 'level_50',     icon: '👑', title: 'Half Century',      desc: 'Reach level 50',                    check: (s) => s.highestLevel >= 50 },
  { id: 'hard_win',     icon: '💪', title: 'Tough Cookie',      desc: 'Complete a level on Hard',          check: (s) => s.hardWins >= 1 },
  { id: 'hard_10',      icon: '🎖️', title: 'Iron Will',         desc: 'Complete 10 levels on Hard',        check: (s) => s.hardWins >= 10 },
];

// Compute achievement stats from localStorage
function getAchievementStats() {
  const highestLevel = getSavedLevel();
  let totalWins = 0;
  let threeStarCount = 0;
  for (let i = 1; i < highestLevel; i++) {
    if (getBestMoves(i) > 0) totalWins++;
    if (getBestStars(i) >= 3) threeStarCount++;
  }
  return {
    highestLevel,
    totalWins,
    threeStarCount,
    bestStreak: parseInt(storageGet('wbeststreak', '0')) || 0,
    hardWins: parseInt(storageGet('whardwins', '0')) || 0,
  };
}

// --------------------------------------------
// AchievementsScreen — full-screen overlay
// --------------------------------------------
function AchievementsScreen({ show, onClose }) {
  if (!show) return null;

  const stats = getAchievementStats();
  const unlocked = ACHIEVEMENTS.filter(a => a.check(stats));
  const locked = ACHIEVEMENTS.filter(a => !a.check(stats));

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        zIndex: 70,
        background: "linear-gradient(160deg, rgba(15,12,41,0.97), rgba(48,43,99,0.97) 50%, rgba(36,36,62,0.97))",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top, 12px))" }}
      >
        <h2 className="font-bold" style={{
          fontFamily: FONTS.orbitron, fontSize: "1rem",
          background: "linear-gradient(135deg,#fff,#fbbf24,#f59e0b)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          ACHIEVEMENTS
        </h2>
        <button
          onClick={onClose}
          className="active:scale-90"
          style={{
            fontSize: "1.4rem", color: "rgba(255,255,255,0.5)",
            lineHeight: 1, padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span style={{
            fontFamily: FONTS.default, fontSize: "0.75rem",
            color: "rgba(255,255,255,0.5)", fontWeight: 600,
          }}>
            {unlocked.length}/{ACHIEVEMENTS.length} unlocked
          </span>
        </div>
        <div className="w-full rounded-full" style={{
          height: 6, background: "rgba(255,255,255,0.08)",
        }}>
          <div className="rounded-full" style={{
            height: 6,
            width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%`,
            background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      {/* Achievement list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ WebkitOverflowScrolling: "touch" }}>
        {/* Unlocked */}
        {unlocked.map(a => (
          <div key={a.id} className="flex items-center gap-3 p-3 mb-2 rounded-xl" style={{
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.2)",
          }}>
            <span style={{ fontSize: "1.5rem" }}>{a.icon}</span>
            <div className="flex-1 min-w-0">
              <div style={{
                fontFamily: FONTS.orbitron, fontSize: "0.75rem",
                fontWeight: 700, color: "#fbbf24",
              }}>
                {a.title}
              </div>
              <div style={{
                fontFamily: FONTS.default, fontSize: "0.65rem",
                color: "rgba(255,255,255,0.5)",
              }}>
                {a.desc}
              </div>
            </div>
            <span style={{ color: "#fbbf24", fontSize: "1rem" }}>✓</span>
          </div>
        ))}

        {/* Locked */}
        {locked.map(a => (
          <div key={a.id} className="flex items-center gap-3 p-3 mb-2 rounded-xl" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            opacity: 0.5,
          }}>
            <span style={{ fontSize: "1.5rem", filter: "grayscale(1)" }}>{a.icon}</span>
            <div className="flex-1 min-w-0">
              <div style={{
                fontFamily: FONTS.orbitron, fontSize: "0.75rem",
                fontWeight: 700, color: "rgba(255,255,255,0.4)",
              }}>
                {a.title}
              </div>
              <div style={{
                fontFamily: FONTS.default, fontSize: "0.65rem",
                color: "rgba(255,255,255,0.25)",
              }}>
                {a.desc}
              </div>
            </div>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "1rem" }}>🔒</span>
          </div>
        ))}
      </div>
    </div>
  );
}
