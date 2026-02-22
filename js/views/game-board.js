// ============================================
// GAME BOARD — bottle grid + deadlock + legend
// ============================================

function GameBoard({
  boardRef, bottles, revealed, selected, hiddenCount,
  shaking, hint, patMode, layout,
  numColors, legendOpen, deadlock, showWin,
  onToggleLegend, onBgTap, onTapBottle, getGhost,
}) {
  const { size, cols, gap } = layout;

  return (
    <>
      {/* Deadlock warning */}
      {deadlock && !showWin && (
        <div className="mx-3 py-1.5 rounded-lg text-center shrink-0" style={{
          background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.2)",
          position: "relative", zIndex: 15,
        }}>
          <span style={{ fontSize: "0.8rem", color: "#ff6b6b", fontFamily: FONTS.default, fontWeight: 600 }}>
            No moves left — Undo or Restart
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="shrink-0" style={{ position: "relative", zIndex: 15 }}>
        <Legend numColors={numColors} open={legendOpen} toggle={onToggleLegend} patMode={patMode} />
      </div>

      {/* Bottle grid */}
      <div
        ref={boardRef}
        className="flex-1 flex items-center justify-center w-full px-1 overflow-hidden"
        style={{ position: "relative", zIndex: 10 }}
        onClick={onBgTap}
      >
        <div className="flex flex-wrap justify-center content-center" style={{ gap, maxWidth: cols * (size + gap) + gap }}>
          {bottles.map((segs, i) => {
            const ghost = getGhost(i);
            return (
              <Bottle
                key={i}
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
                onClick={() => onTapBottle(i)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
