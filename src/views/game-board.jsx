// ============================================
// GAME BOARD — bottle grid + deadlock + legend
// ============================================

import React from 'react';
import { FONTS, UI } from '../constants.js';
import { isDoneBottle } from '../game.js';
import { Bottle, Legend } from '../components.jsx';

export function GameBoard({
  boardRef, bottles, revealed, selected, hiddenCount,
  shaking, hint, patMode, layout,
  numColors, legendOpen, deadlock, showWin,
  onToggleLegend, onBgTap, onTapBottle, getGhost,
  boardKey, lastPour, onUndo, onRestart, canUndo,
}) {
  const { size, cols, gap } = layout;

  return (
    <>
      {/* Deadlock warning with inline actions */}
      {deadlock && !showWin && (
        <div className="mx-3 py-1.5 px-2 rounded-lg flex items-center justify-center gap-2 shrink-0" style={{
          background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.2)",
          position: "relative", zIndex: 15,
        }}>
          <span style={{ fontSize: UI.font.sm, color: "#ff6b6b", fontFamily: FONTS.default, fontWeight: 600 }}>
            No moves left
          </span>
          {canUndo && (
            <button
              onClick={onUndo}
              className="px-2.5 py-1 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: UI.border.subtle,
                borderRadius: UI.radius.pill,
                color: UI.text.primary,
                fontSize: UI.font.xs,
                fontFamily: FONTS.default,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ↶ UNDO
            </button>
          )}
          <button
            onClick={onRestart}
            className="px-2.5 py-1 active:scale-95"
            style={{
              background: "rgba(255,50,50,0.2)",
              border: "1px solid rgba(255,50,50,0.35)",
              borderRadius: UI.radius.pill,
              color: "#ffb4b4",
              fontSize: UI.font.xs,
              fontFamily: FONTS.default,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ⟳ RETRY
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="shrink-0" style={{ position: "relative", zIndex: 15 }}>
        <Legend numColors={numColors} open={legendOpen} toggle={onToggleLegend} patMode={patMode} />
      </div>

      {/* Bottle grid — keyed by boardKey so new levels, retries, and undos
          replay the entrance animation */}
      <div
        ref={boardRef}
        className="flex-1 flex items-center justify-center w-full px-1 overflow-hidden"
        style={{ position: "relative", zIndex: UI.z.board }}
        onClick={onBgTap}
      >
        <div
          key={boardKey}
          className="flex flex-wrap justify-center content-center"
          style={{ gap, maxWidth: cols * (size + gap) + gap, animation: "levelIn 0.3s ease-out" }}
        >
          {bottles.map((segs, i) => {
            const ghost = getGhost(i);
            return (
              <Bottle
                key={i}
                index={i}
                segments={segs}
                revealedArr={revealed[i]}
                selected={selected === i}
                completed={isDoneBottle(segs, revealed[i])}
                hiddenCount={hiddenCount}
                shaking={shaking === i}
                size={size}
                ghostCount={ghost.count}
                ghostColor={ghost.color}
                hinted={hint && (hint.from === i || hint.to === i)}
                patMode={patMode}
                pourIn={lastPour && lastPour.to === i ? lastPour : null}
                pourOut={lastPour && lastPour.from === i ? lastPour : null}
                onClick={() => onTapBottle(i)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
