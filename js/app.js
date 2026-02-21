// ============================================
// MAIN APP COMPONENT
// ============================================

const { useState, useEffect, useCallback, useRef } = React;

function App() {
  // --- State ---
  const [level, setLevel] = useState(getSavedLevel);
  const [bottles, setBottles] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [numColors, setNumColors] = useState(3);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState([]);
  const [showWin, setShowWin] = useState(false);
  const [best, setBest] = useState(0);
  const [shaking, setShaking] = useState(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [streak, setStreak] = useState(getStreak);
  const [layout, setLayout] = useState({ size: 48, cols: 5, gap: 6 });
  const [muted, setMuted] = useState(getMuted);
  const [patMode, setPatMode] = useState(getPatternMode);
  const [hint, setHint] = useState(null);
  const [hintsLeft, setHintsLeft] = useState(DIFFICULTY_LIMITS.normal.hints);
  const [undosLeft, setUndosLeft] = useState(DIFFICULTY_LIMITS.normal.undos);
  const [deadlock, setDeadlock] = useState(false);
  const [difficulty, setDifficulty] = useState(getDifficulty);
  const [showSettings, setShowSettings] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mopt, setMopt] = useState(-1);
  const [stars, setStars] = useState(0);
  const [bestStars, setBestStars] = useState(0);

  const timerRunning = !showWin && bottles.length > 0;
  const { time, reset: resetTimer } = useTimer(timerRunning);

  const play = useCallback((fn) => { if (!muted) fn(); }, [muted]);

  // --- Layout on resize ---
  const boardRef = useRef(null);

  useEffect(() => {
    const recalc = () => {
      const boardH = boardRef.current ? boardRef.current.clientHeight : window.innerHeight - 155;
      setLayout(calculateLayout(bottles.length || 5, window.innerWidth, boardH));
    };

    recalc();
    window.addEventListener("resize", recalc);
    const onOrient = () => setTimeout(recalc, 150);
    window.addEventListener("orientationchange", onOrient);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("orientationchange", onOrient);
    };
  }, [bottles.length]);

  // --- Initialize level ---
  const initLevel = useCallback((lvl) => {
    const g = generateLevel(lvl, difficulty);
    setBottles(g.bottles);
    setRevealed(g.revealed);
    setNumColors(g.numColors);
    setHiddenCount(g.hiddenCount);
    setSelected(null);
    setMoves(0);
    setHistory([]);
    setShowWin(false);
    setBest(getBestMoves(lvl));
    setShaking(null);
    setHint(null);
    const limits = DIFFICULTY_LIMITS[difficulty] || DIFFICULTY_LIMITS.normal;
    setHintsLeft(limits.hints);
    setUndosLeft(limits.undos);
    setDeadlock(false);
    setMopt(-1);
    setStars(0);
    setBestStars(getBestStars(lvl));
    resetTimer();
    saveLevel(lvl);

    // Compute optimal moves asynchronously (deferred so UI paints first)
    const bottlesCopy = g.bottles.map(b => [...b]);
    setTimeout(() => {
      const optimal = solveBFS(bottlesCopy, BOTTLE_CAPACITY);
      setMopt(optimal);
    }, 50);
  }, [resetTimer, difficulty]);

  useEffect(() => { initLevel(level); }, [level, initLevel, difficulty]);

  // --- Deadlock detection ---
  useEffect(() => {
    if (!bottles.length || !revealed.length || showWin) { setDeadlock(false); return; }
    if (isWinCondition(bottles, revealed)) { setDeadlock(false); return; }
    setDeadlock(isDeadlocked(bottles));
  }, [bottles, revealed, showWin]);

  // --- Actions ---
  const doShake = useCallback((i) => {
    setShaking(i);
    setTimeout(() => setShaking(null), 300);
  }, []);

  const handleTap = useCallback((idx) => {
    if (showWin) return;
    haptic();
    play(soundTap);
    setHint(null);

    if (selected === null) {
      if (bottles[idx].length > 0 && !isDoneBottle(bottles[idx], revealed[idx])) {
        setSelected(idx);
      }
      return;
    }

    if (selected === idx) { setSelected(null); return; }

    if (canPour(bottles, selected, idx)) {
      setHistory(h => [...h, {
        bottles: bottles.map(b => [...b]),
        revealed: revealed.map(r => [...r]),
        moves,
      }]);
      setMoves(m => m + 1);
      play(soundPour);

      const result = pour(bottles, revealed, selected, idx);
      setBottles(result.bottles);
      setRevealed(result.revealed);
      setSelected(null);

      if (isDoneBottle(result.bottles[idx], result.revealed[idx])) play(soundDone);

      if (isWinCondition(result.bottles, result.revealed)) {
        hapticWin();
        play(soundWin);
        const totalMoves = moves + 1;
        saveBestMoves(level, totalMoves);
        setBest(prev => (!prev || totalMoves < prev) ? totalMoves : prev);
        const ns = streak + 1;
        setStreak(ns);
        saveStreak(ns);
        // Star rating
        const s = starsFromMoves(totalMoves, mopt);
        setStars(s);
        if (s > 0) {
          saveBestStars(level, s);
          setBestStars(prev => Math.max(prev, s));
        }
        setTimeout(() => setShowWin(true), 400);
      }
    } else {
      hapticError();
      play(soundError);
      doShake(idx);
      setSelected(null);
    }
  }, [bottles, revealed, selected, showWin, moves, level, doShake, streak, play, mopt]);

  const undo = useCallback(() => {
    if (!history.length || undosLeft <= 0) return;
    haptic();
    play(soundTap);
    const last = history[history.length - 1];
    setBottles(last.bottles);
    setRevealed(last.revealed);
    setMoves(last.moves);
    setHistory(h => h.slice(0, -1));
    setSelected(null);
    setHint(null);
    setUndosLeft(u => u - 1);
  }, [history, play, undosLeft]);

  const restart = useCallback(() => {
    setStreak(0); saveStreak(0);
    initLevel(level);
    play(soundTap);
  }, [level, initLevel, play]);

  const doHint = useCallback(() => {
    if (hintsLeft <= 0) return;
    const h = findHint(bottles);
    if (h) {
      setHint(h);
      setHintsLeft(n => n - 1);
      play(soundTap);
      setTimeout(() => setHint(null), 2000);
    }
  }, [bottles, play, hintsLeft]);

  const handleBgTap = useCallback((e) => {
    if (e.target === e.currentTarget && selected !== null) { setSelected(null); haptic(); }
  }, [selected]);

  const getGhost = useCallback((idx) => {
    if (selected === null || selected === idx || !canPour(bottles, selected, idx)) {
      return { count: 0, color: null };
    }
    return { count: pourCount(bottles, selected, idx), color: topColor(bottles[selected]) };
  }, [bottles, selected]);

  // --- Derived values ---
  const { size, cols, gap } = layout;
  const doneCount = bottles.filter((b, i) => isDoneBottle(b, revealed[i])).length;
  const hiddenLabel = hiddenCount === 0 ? null : hiddenCount >= 3 ? "TOP" : `H${hiddenCount}`;

  const diffColor = difficulty === 'easy' ? '#4ade80' : difficulty === 'hard' ? '#f87171' : '#facc15';

  const undoLabel = undosLeft === Infinity ? "UNDO" : `UNDO ×${undosLeft}`;

  const CONTROLS = [
    { fn: undo, dis: !history.length || undosLeft <= 0, label: undosLeft > 0 ? undoLabel : "—", icon: "↶" },
    { fn: doHint, dis: deadlock || hintsLeft <= 0, label: hintsLeft > 0 ? `HINT ×${hintsLeft}` : "—", icon: "?" },
    { fn: restart, label: "RETRY", icon: "⟳" },
    {
      fn: () => { setStreak(0); saveStreak(0); setLevel(1); haptic(); },
      label: "LV.1", icon: "1",
    },
    {
      fn: () => setMuted(m => { saveMuted(!m); return !m; }),
      label: muted ? "SOUND" : "MUTE", icon: "♪",
    },
    {
      fn: () => setPatMode(p => { savePatternMode(!p); return !p; }),
      label: patMode ? "COLOR" : "A11Y", icon: patMode ? "●" : "◑",
    },
    { fn: () => { setLevel(l => l + 1); haptic(); }, label: "SKIP", icon: "»" },
  ];

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden select-none"
      style={{
        background: "linear-gradient(160deg, #0f0c29, #302b63 50%, #24243e)",
        touchAction: "manipulation",
        overscrollBehavior: "none",
        WebkitUserSelect: "none",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* ---------- CSS animations ---------- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');

        @keyframes twinkle     { 0%,100%{opacity:.2} 50%{opacity:.8} }
        @keyframes bounceIn    { 0%{transform:scale(.3);opacity:0} 50%{transform:scale(1.08)} 70%{transform:scale(.95)} 100%{transform:scale(1);opacity:1} }
        @keyframes float       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer     { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pulse       { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes wave        { 0%,100%{transform:translateX(-10%) scaleY(1)} 50%{transform:translateX(10%) scaleY(1.5)} }
        @keyframes shake       { 0%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(3px)} 60%{transform:translateX(-2px)} 80%{transform:translateX(1px)} 100%{transform:translateX(0)} }
        @keyframes confettiFall{ 0%{transform:translateY(0) translateX(0) rotate(0);opacity:1} 100%{transform:translateY(100vh) translateX(var(--drift)) rotate(var(--rot));opacity:0} }
        @keyframes hintPulse   { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }

        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <Stars />

      {/* ---------- Header ---------- */}
      <div className="w-full px-3 pt-2 pb-1 shrink-0" style={{ position: "relative", zIndex: 20 }}>
        <div className="flex items-center justify-between max-w-3xl mx-auto">

          {/* Left: level info badges */}
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <button
              onClick={() => setShowMap(true)}
              className="font-black active:scale-95"
              style={{
                fontFamily: FONTS.orbitron, fontSize: "1.1rem",
                background: "linear-gradient(135deg,#fff,#c084fc,#818cf8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}
            >
              LV{level}
            </button>

            <span className="px-2 py-0.5 rounded-full" style={{
              background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.75rem",
              fontFamily: FONTS.default, fontWeight: 600,
            }}>
              {moves} mv
            </span>

            {bestStars > 0 && (
              <span className="px-1.5 py-0.5 rounded-full" style={{
                background: "rgba(255,215,0,0.1)", color: "#FFD700",
                border: "1px solid rgba(255,215,0,0.15)", fontSize: "0.7rem",
                fontFamily: FONTS.default,
              }}>
                {"★".repeat(bestStars)}{"☆".repeat(3 - bestStars)}
              </span>
            )}

            {best > 0 && !bestStars && (
              <span className="px-1.5 py-0.5 rounded-full" style={{
                background: "rgba(255,215,0,0.1)", color: "#FFD700",
                border: "1px solid rgba(255,215,0,0.15)", fontSize: "0.7rem",
                fontFamily: FONTS.default,
              }}>
                ★{best}
              </span>
            )}

            {streak > 1 && (
              <span className="px-1.5 py-0.5 rounded-full" style={{
                background: "rgba(255,100,0,0.12)", color: "#FF6B35",
                border: "1px solid rgba(255,100,0,0.18)", fontSize: "0.7rem",
                fontFamily: FONTS.default,
              }}>
                🔥{streak}
              </span>
            )}

            <span className="px-1.5 py-0.5 rounded-full" style={{
              background: `${diffColor}15`,
              color: diffColor,
              border: `1px solid ${diffColor}25`,
              fontSize: "0.65rem",
              fontWeight: 700,
              fontFamily: FONTS.default,
              textTransform: "uppercase",
            }}>
              {difficulty}
            </span>

            {hiddenLabel && (
              <span className="px-1.5 py-0.5 rounded-full" style={{
                background: "rgba(255,0,110,0.15)", color: "#FF006E",
                border: "1px solid rgba(255,0,110,0.2)", fontSize: "0.65rem",
                fontWeight: 700, fontFamily: FONTS.default, animation: "pulse 2s infinite",
              }}>
                🔒{hiddenLabel}
              </span>
            )}
          </div>

          {/* Right: settings gear + timer + progress ring */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowSettings(true)}
              className="active:scale-90"
              style={{
                fontSize: "1.1rem",
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1,
                padding: 4,
              }}
              aria-label="Settings"
            >
              ⚙
            </button>
            <span style={{
              fontFamily: FONTS.orbitron, fontSize: "0.75rem",
              color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em",
            }}>
              {time}
            </span>

            <div className="relative" style={{ width: 32, height: 32 }}>
              <svg width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
                <circle
                  cx="16" cy="16" r="13" fill="none" stroke="#8b5cf6" strokeWidth="2.5"
                  strokeDasharray={`${(doneCount / Math.max(1, numColors)) * 81.7} 81.7`}
                  strokeLinecap="round" transform="rotate(-90 16 16)"
                  style={{ transition: "stroke-dasharray 0.4s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center" style={{
                fontSize: "0.65rem", fontWeight: 700,
                color: "rgba(255,255,255,0.55)", fontFamily: FONTS.default,
              }}>
                {doneCount}/{numColors}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Deadlock warning ---------- */}
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

      {/* ---------- Legend ---------- */}
      <div className="shrink-0" style={{ position: "relative", zIndex: 15 }}>
        <Legend numColors={numColors} open={legendOpen} toggle={() => setLegendOpen(o => !o)} patMode={patMode} />
      </div>

      {/* ---------- Game board ---------- */}
      <div
        ref={boardRef}
        className="flex-1 flex items-center justify-center w-full px-1 overflow-hidden"
        style={{ position: "relative", zIndex: 10 }}
        onClick={handleBgTap}
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
                onClick={() => handleTap(i)}
              />
            );
          })}
        </div>
      </div>

      {/* ---------- Bottom controls ---------- */}
      <div className="shrink-0 px-2 pb-1.5" style={{
        position: "relative", zIndex: 20,
        paddingBottom: "max(6px, env(safe-area-inset-bottom, 6px))",
      }}>
        <div className="flex justify-center gap-1.5 max-w-md mx-auto">
          {CONTROLS.map((btn, i) => (
            <button
              key={i}
              onClick={btn.fn}
              disabled={btn.dis}
              className="flex-1 flex flex-col items-center justify-center rounded-xl active:scale-90 disabled:opacity-25"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                minHeight: 48,
                maxWidth: 64,
                transition: "transform 0.1s",
              }}
            >
              <span style={{ fontSize: "1.1rem", lineHeight: 1, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>
                {btn.icon}
              </span>
              <span style={{
                fontSize: "0.55rem", color: "rgba(255,255,255,0.45)",
                fontFamily: FONTS.default, fontWeight: 700, marginTop: 2, letterSpacing: "0.03em",
              }}>
                {btn.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Win screen ---------- */}
      {showWin && (
        <>
          <Confetti />
          <div className="fixed inset-0 flex items-center justify-center px-6" style={{
            zIndex: 50, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)",
          }}>
            <div className="text-center p-6 rounded-3xl w-full max-w-xs" style={{
              background: "linear-gradient(160deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              animation: "bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 6, animation: "float 2s ease-in-out infinite" }}>
                🎉
              </div>

              <h2 className="font-black tracking-wider mb-2" style={{
                fontFamily: FONTS.orbitron,
                fontSize: "1.2rem",
                background: "linear-gradient(135deg,#fbbf24,#f59e0b,#fbbf24)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 2s linear infinite",
              }}>
                COMPLETE!
              </h2>

              {stars > 0 && (
                <div className="flex justify-center gap-1 mb-2" style={{ fontSize: "1.6rem" }}>
                  {[1, 2, 3].map(i => (
                    <span key={i} style={{
                      color: i <= stars ? "#fbbf24" : "rgba(255,255,255,0.15)",
                      textShadow: i <= stars ? "0 0 8px rgba(251,191,36,0.5)" : "none",
                      transition: "all 0.3s ease",
                      animationDelay: `${i * 0.15}s`,
                    }}>
                      ★
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-center gap-4 mb-4" style={{ fontFamily: FONTS.default }}>
                {[
                  { value: moves, label: "moves", color: null },
                  mopt > 0 ? { value: mopt, label: "optimal", color: "#a78bfa" } : null,
                  { value: time, label: "time", color: null },
                  streak > 1 ? { value: `🔥${streak}`, label: "streak", color: "#FF6B35" } : null,
                ].filter(Boolean).map((stat, i) => (
                  <div key={i} className="text-center">
                    <div style={{ fontSize: "1.3rem", color: stat.color || undefined }}
                      className={`font-bold ${!stat.color ? "text-purple-200" : ""}`}
                    >
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setLevel(l => l + 1); haptic(); }}
                className="w-full py-3 rounded-2xl font-bold text-white active:scale-95"
                style={{
                  fontFamily: FONTS.orbitron,
                  fontSize: "0.85rem",
                  background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  boxShadow: "0 4px 16px rgba(139,92,246,0.35)",
                  letterSpacing: "0.1em",
                  minHeight: 48,
                }}
              >
                NEXT LEVEL →
              </button>
            </div>
          </div>
        </>
      )}

      {/* ---------- Level map ---------- */}
      <LevelMap
        show={showMap}
        onClose={() => setShowMap(false)}
        currentLevel={level}
        onSelectLevel={n => { setStreak(0); saveStreak(0); setLevel(n); setShowMap(false); haptic(); }}
      />

      {/* ---------- Settings modal ---------- */}
      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        difficulty={difficulty}
        onChangeDifficulty={(tier) => {
          setDifficulty(tier);
          saveDifficulty(tier);
        }}
      />

      {/* ---------- Decorative blurs ---------- */}
      <div className="fixed pointer-events-none" style={{
        width: 140, height: 140, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)",
        top: "6%", right: "-4%", filter: "blur(35px)",
        animation: "float 6s ease-in-out infinite", zIndex: 0,
      }} />
      <div className="fixed pointer-events-none" style={{
        width: 100, height: 100, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)",
        bottom: "10%", left: "-3%", filter: "blur(25px)",
        animation: "float 8s ease-in-out 2s infinite", zIndex: 0,
      }} />
    </div>
  );
}

// Mount
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
