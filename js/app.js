// ============================================
// MAIN APP COMPONENT
// ============================================

function App() {
  // --- Core game state ---
  const [level, setLevel] = React.useState(getSavedLevel);
  const [bottles, setBottles] = React.useState([]);
  const [revealed, setRevealed] = React.useState([]);
  const [numColors, setNumColors] = React.useState(3);
  const [hiddenCount, setHiddenCount] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const [moves, setMoves] = React.useState(0);
  const [history, setHistory] = React.useState([]);
  const [showWin, setShowWin] = React.useState(false);
  const [best, setBest] = React.useState(0);
  const [shaking, setShaking] = React.useState(null);
  const [streak, setStreak] = React.useState(getStreak);
  const [layout, setLayout] = React.useState({ size: 48, cols: 5, gap: 6 });

  // --- Preferences ---
  const [muted, setMuted] = React.useState(getMuted);
  const [patMode, setPatMode] = React.useState(getPatternMode);
  const [difficulty, setDifficulty] = React.useState(getDifficulty);
  const [backgroundId, setBackgroundId] = React.useState(getBackground);

  // --- Hints & undo limits ---
  const [hint, setHint] = React.useState(null);
  const [hintsLeft, setHintsLeft] = React.useState(DIFFICULTY_LIMITS.normal.hints);
  const [undosLeft, setUndosLeft] = React.useState(DIFFICULTY_LIMITS.normal.undos);

  // --- Solver & stars ---
  const [deadlock, setDeadlock] = React.useState(false);
  const [mopt, setMopt] = React.useState(-1);
  const [stars, setStars] = React.useState(0);
  const [bestStars, setBestStars] = React.useState(0);

  // --- UI toggles ---
  const [legendOpen, setLegendOpen] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showMap, setShowMap] = React.useState(false);
  const [showAchievements, setShowAchievements] = React.useState(false);

  // --- Timer ---
  const timerRunning = !showWin && bottles.length > 0;
  const { time, reset: resetTimer } = useTimer(timerRunning);

  // --- Audio helper ---
  const play = React.useCallback((fn) => { if (!muted) fn(); }, [muted]);

  // --- Layout on resize ---
  const boardRef = React.useRef(null);

  React.useEffect(() => {
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
  const initLevel = React.useCallback((lvl) => {
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

    // Compute optimal moves asynchronously
    const bottlesCopy = g.bottles.map(b => [...b]);
    setTimeout(() => {
      const optimal = solveBFS(bottlesCopy, BOTTLE_CAPACITY);
      setMopt(optimal);
    }, 50);
  }, [resetTimer, difficulty]);

  React.useEffect(() => { initLevel(level); }, [level, initLevel, difficulty]);

  // --- Deadlock detection ---
  React.useEffect(() => {
    if (!bottles.length || !revealed.length || showWin) { setDeadlock(false); return; }
    if (isWinCondition(bottles, revealed)) { setDeadlock(false); return; }
    setDeadlock(isDeadlocked(bottles));
  }, [bottles, revealed, showWin]);

  // --- Actions ---
  const doShake = React.useCallback((i) => {
    setShaking(i);
    setTimeout(() => setShaking(null), 300);
  }, []);

  const handleTap = React.useCallback((idx) => {
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

  const undo = React.useCallback(() => {
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

  const restart = React.useCallback(() => {
    setStreak(0); saveStreak(0);
    initLevel(level);
    play(soundTap);
  }, [level, initLevel, play]);

  const doHint = React.useCallback(() => {
    if (hintsLeft <= 0) return;
    const h = findHint(bottles);
    if (h) {
      setHint(h);
      setHintsLeft(n => n - 1);
      play(soundTap);
      setTimeout(() => setHint(null), 2000);
    }
  }, [bottles, play, hintsLeft]);

  const handleBgTap = React.useCallback((e) => {
    if (e.target === e.currentTarget && selected !== null) { setSelected(null); haptic(); }
  }, [selected]);

  const getGhost = React.useCallback((idx) => {
    if (selected === null || selected === idx || !canPour(bottles, selected, idx)) {
      return { count: 0, color: null };
    }
    return { count: pourCount(bottles, selected, idx), color: topColor(bottles[selected]) };
  }, [bottles, selected]);

  const nextLevel = React.useCallback(() => {
    setLevel(l => l + 1);
    haptic();
  }, []);

  // --- Derived values ---
  const doneCount = bottles.filter((b, i) => isDoneBottle(b, revealed[i])).length;
  const undoLabel = undosLeft === Infinity ? "UNDO" : `UNDO ×${undosLeft}`;

  const controls = [
    { fn: undo, dis: !history.length || undosLeft <= 0, label: undosLeft > 0 ? undoLabel : "—", icon: "↶" },
    { fn: doHint, dis: deadlock || hintsLeft <= 0, label: hintsLeft > 0 ? `HINT ×${hintsLeft}` : "—", icon: "?" },
    { fn: restart, label: "RETRY", icon: "⟳" },
    { fn: () => { setStreak(0); saveStreak(0); setLevel(1); haptic(); }, label: "LV.1", icon: "1" },
    { fn: () => setMuted(m => { saveMuted(!m); return !m; }), label: muted ? "SOUND" : "MUTE", icon: "♪" },
    { fn: () => setPatMode(p => { savePatternMode(!p); return !p; }), label: patMode ? "COLOR" : "A11Y", icon: patMode ? "●" : "◑" },
    { fn: () => { setLevel(l => l + 1); haptic(); }, label: "SKIP", icon: "»" },
  ];

  // --- Render ---
  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden select-none"
      style={{
        background: (() => {
          const bg = BACKGROUNDS.find(b => b.id === backgroundId) || BACKGROUNDS[0];
          if (bg.url) return `url(${bg.url}) center/cover no-repeat`;
          return `linear-gradient(160deg, ${bg.colors[0]}, ${bg.colors[1]} 50%, ${bg.colors[2]})`;
        })(),
        touchAction: "manipulation",
        overscrollBehavior: "none",
        WebkitUserSelect: "none",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* CSS animations */}
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

      <Header
        level={level}
        moves={moves}
        bestStars={bestStars}
        best={best}
        streak={streak}
        difficulty={difficulty}
        hiddenCount={hiddenCount}
        time={time}
        doneCount={doneCount}
        numColors={numColors}
        onOpenMap={() => setShowMap(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      <GameBoard
        boardRef={boardRef}
        bottles={bottles}
        revealed={revealed}
        selected={selected}
        hiddenCount={hiddenCount}
        shaking={shaking}
        hint={hint}
        patMode={patMode}
        layout={layout}
        numColors={numColors}
        legendOpen={legendOpen}
        deadlock={deadlock}
        showWin={showWin}
        onToggleLegend={() => setLegendOpen(o => !o)}
        onBgTap={handleBgTap}
        onTapBottle={handleTap}
        getGhost={getGhost}
      />

      <BottomControls controls={controls} />

      <WinScreen
        show={showWin}
        stars={stars}
        moves={moves}
        mopt={mopt}
        time={time}
        streak={streak}
        onNext={nextLevel}
      />

      <LevelMap
        show={showMap}
        onClose={() => setShowMap(false)}
        currentLevel={level}
        onSelectLevel={n => { setStreak(0); saveStreak(0); setLevel(n); setShowMap(false); haptic(); }}
      />

      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        difficulty={difficulty}
        onChangeDifficulty={(tier) => {
          setDifficulty(tier);
          saveDifficulty(tier);
        }}
        backgroundId={backgroundId}
        onChangeBackground={(id) => {
          setBackgroundId(id);
          saveBackground(id);
        }}
        onOpenAchievements={() => { setShowSettings(false); setShowAchievements(true); }}
      />

      <AchievementsScreen
        show={showAchievements}
        onClose={() => setShowAchievements(false)}
      />

      {/* Decorative blurs */}
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
