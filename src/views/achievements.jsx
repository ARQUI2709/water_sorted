// ============================================
// ACHIEVEMENTS — track player milestones
// ============================================

import React from 'react';
import { FONTS, UI } from '../constants.js';
import { getMaxLevel, getBestMoves, getBestStars, getBestStreak, getHardWins } from '../storage.js';
import { FullScreenPanel } from '../components/chrome.jsx';

// Achievement definitions
export const ACHIEVEMENTS = [
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
export function getAchievementStats() {
  const highestLevel = getMaxLevel();
  let totalWins = 0;
  let threeStarCount = 0;
  for (let i = 1; i <= highestLevel; i++) {
    if (getBestMoves(i) > 0) totalWins++;
    if (getBestStars(i) >= 3) threeStarCount++;
  }
  return {
    highestLevel,
    totalWins,
    threeStarCount,
    bestStreak: getBestStreak(),
    hardWins: getHardWins(),
  };
}

// --------------------------------------------
// AchievementsScreen — full-screen overlay
// --------------------------------------------
export function AchievementsScreen({ show, onClose }) {
  if (!show) return null;

  const stats = getAchievementStats();
  const unlocked = ACHIEVEMENTS.filter(a => a.check(stats));
  const locked = ACHIEVEMENTS.filter(a => !a.check(stats));

  return (
    <FullScreenPanel
      show={show}
      onClose={onClose}
      title="ACHIEVEMENTS"
      titleGradient="linear-gradient(135deg,#fff,#fbbf24,#f59e0b)"
    >
      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span style={{
            fontFamily: FONTS.default, fontSize: UI.font.sm,
            color: UI.text.secondary, fontWeight: 600,
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
            background: UI.accent.goldGrad,
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      {/* Achievement list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ WebkitOverflowScrolling: "touch" }}>
        {/* Unlocked */}
        {unlocked.map(a => (
          <div key={a.id} className="flex items-center gap-3 p-3 mb-2" style={{
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.2)",
            borderRadius: UI.radius.md,
          }}>
            <span style={{ fontSize: "1.5rem" }}>{a.icon}</span>
            <div className="flex-1 min-w-0">
              <div style={{
                fontFamily: FONTS.orbitron, fontSize: UI.font.sm,
                fontWeight: 700, color: UI.accent.gold,
              }}>
                {a.title}
              </div>
              <div style={{
                fontFamily: FONTS.default, fontSize: UI.font.xs,
                color: UI.text.secondary,
              }}>
                {a.desc}
              </div>
            </div>
            <span style={{ color: UI.accent.gold, fontSize: UI.font.lg }}>✓</span>
          </div>
        ))}

        {/* Locked — grayscale icons but readable text (no washed-out wrapper opacity) */}
        {locked.map(a => (
          <div key={a.id} className="flex items-center gap-3 p-3 mb-2" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: UI.radius.md,
          }}>
            <span style={{ fontSize: "1.5rem", filter: "grayscale(1)", opacity: 0.6 }}>{a.icon}</span>
            <div className="flex-1 min-w-0">
              <div style={{
                fontFamily: FONTS.orbitron, fontSize: UI.font.sm,
                fontWeight: 700, color: UI.text.secondary,
              }}>
                {a.title}
              </div>
              <div style={{
                fontFamily: FONTS.default, fontSize: UI.font.xs,
                color: UI.text.muted,
              }}>
                {a.desc}
              </div>
            </div>
            <span style={{ color: UI.text.muted, fontSize: UI.font.lg }}>🔒</span>
          </div>
        ))}
      </div>
    </FullScreenPanel>
  );
}
