// ============================================
// MAIN APP COMPONENT
// ============================================

import React from 'react';
import { BACKGROUNDS, BOTTLE_CAPACITY, DIFFICULTY_LIMITS, UI } from './constants.js';
import {
  soundTap, soundPour, soundError, soundWin, soundDone,
  haptic, hapticError, hapticWin,
} from './audio.js';
import {
  getSavedLevel, saveLevel, getMaxLevel, saveMaxLevel,
  getStreak, saveStreak, saveBestStreak, incrementHardWins,
  getMuted, saveMuted, getPatternMode, savePatternMode,
  getDifficulty, saveDifficulty, getBackground, saveBackground,
  getBestMoves, saveBestMoves, getBestStars, saveBestStars,
  getTutorialSeen, saveTutorialSeen, getLegendSeen, saveLegendSeen,
} from './storage.js';
import {
  generateLevel, canPour, pour, pourCount, topColor,
  isDoneBottle, isWinCondition, isDeadlocked, findHint, calculateLayout,
} from './game.js';
import { starsFromMoves, movesLowerBound } from './solver.js';
import { useTimer, useWakeLock } from './hooks.js';
import { Stars } from './components.jsx';
import { Toast } from './components/chrome.jsx';
import { Tutorial } from './views/tutorial.jsx';
import { Header } from './views/header.jsx';
import { BottomControls } from './views/controls.jsx';
import { GameBoard } from './views/game-board.jsx';
import { LevelMap } from './views/map.jsx';
import { WinScreen } from './views/win-screen.jsx';
import { SettingsModal } from './views/settings.jsx';
import { AchievementsScreen } from './views/achievements.jsx';
import { HomeScreen } from './views/home.jsx';

export default function App() {
  // --- Core game state ---
  const [level, setLevel] = React.useState(getSavedLevel);
  const [maxLevel, setMaxLevel] = React.useState(getMaxLevel);
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

  // Difficulty is read through a ref by initLevel so changing it mid-level
  // does NOT regenerate the board — it applies from the next init (next
  // level, retry, or map selection).
  const difficultyRef = React.useRef(difficulty);
  // The tier the current level was actually generated with (can lag behind
  // the `difficulty` preference until the next level starts).
  const [levelTier, setLevelTier] = React.useState(difficulty);

  // --- Hints, undo & add-bottle limits ---
  const [hint, setHint] = React.useState(null);
  const [hintsLeft, setHintsLeft] = React.useState(DIFFICULTY_LIMITS.normal.hints);
  const [undosLeft, setUndosLeft] = React.useState(DIFFICULTY_LIMITS.normal.undos);
  const [addBottlesLeft, setAddBottlesLeft] = React.useState(DIFFICULTY_LIMITS.normal.addBottles);

  // --- Solver & stars ---
  const [deadlock, setDeadlock] = React.useState(false);
  const [mopt, setMopt] = React.useState(-1);       // exact optimum, -1 = unknown
  const [moptLB, setMoptLB] = React.useState(0);     // lower bound, stars fallback
  const [stars, setStars] = React.useState(0);
  const [bestStars, setBestStars] = React.useState(0);

  // --- UI toggles ---
  const [legendOpen, setLegendOpen] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showMap, setShowMap] = React.useState(false);
  const [showAchievements, setShowAchievements] = React.useState(false);
  const [showHome, setShowHome] = React.useState(true);
  const [showTutorial, setShowTutorial] = React.useState(false);

  // --- Transient UI feedback ---
  // Cosmetic pour-animation record; game state is committed instantly, so
  // rapid taps / undo / win detection never wait on the animation.
  const [lastPour, setLastPour] = React.useState(null);
  const pourTimerRef = React.useRef(null);
  // Remount key for the bottle grid: bumping it replays the entrance
  // animation (new level, retry, undo).
  const [boardKey, setBoardKey] = React.useState(0);
  const [hintPending, setHintPending] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const toastTimerRef = React.useRef(null);

  const showToast = React.useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 1800);
  }, []);

  // --- Timer ---
  const timerRunning = !showWin && !showHome && bottles.length > 0;
  const { time, reset: resetTimer } = useTimer(timerRunning);

  // Keep the screen awake while a puzzle is on screen
  useWakeLock(!showHome && bottles.length > 0);

  // --- Audio helper ---
  const play = React.useCallback((fn) => { if (!muted) fn(); }, [muted]);

  // --- Solver worker ---
  // BFS runs off the main thread; requests are correlated by id and stale
  // responses (from a previous level) are dropped via levelSeqRef.
  const workerRef = React.useRef(null);
  const solveCallbacksRef = React.useRef(new Map());
  const solveIdRef = React.useRef(0);
  const levelSeqRef = React.useRef(0);

  const requestSolve = React.useCallback((bottlesToSolve, options) => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        try {
          workerRef.current = new Worker(
            new URL('./solver.worker.js', import.meta.url),
            { type: 'module' },
          );
          workerRef.current.onmessage = (e) => {
            const cb = solveCallbacksRef.current.get(e.data.id);
            if (cb) {
              solveCallbacksRef.current.delete(e.data.id);
              cb(e.data.result);
            }
          };
        } catch {
          workerRef.current = null;
          resolve({ status: 'budget' });
          return;
        }
      }
      const id = ++solveIdRef.current;
      solveCallbacksRef.current.set(id, resolve);
      workerRef.current.postMessage({ id, bottles: bottlesToSolve, cap: BOTTLE_CAPACITY, options });
    });
  }, []);

  React.useEffect(() => () => {
    workerRef.current?.terminate();
    clearTimeout(pourTimerRef.current);
    clearTimeout(toastTimerRef.current);
  }, []);

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
    const tier = difficultyRef.current;
    const g = generateLevel(lvl, tier);
    setLevelTier(tier);
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
    setLastPour(null);
    setBoardKey(k => k + 1);
    // Surface the legend once, the first time a busy palette shows up.
    if (g.numColors >= 7 && !getLegendSeen()) {
      setLegendOpen(true);
      saveLegendSeen();
    }
    const limits = DIFFICULTY_LIMITS[tier] || DIFFICULTY_LIMITS.normal;
    setHintsLeft(limits.hints);
    setUndosLeft(limits.undos);
    setAddBottlesLeft(limits.addBottles ?? 0);
    setDeadlock(false);
    setMopt(-1);
    setMoptLB(Math.max(1, movesLowerBound(g.bottles)));
    setStars(0);
    setBestStars(getBestStars(lvl));
    resetTimer();
    saveLevel(lvl);
    saveMaxLevel(lvl);
    setMaxLevel(m => Math.max(m, lvl));

    // Compute optimal moves in the worker; drop the result if another
    // level was initialized in the meantime.
    const seq = ++levelSeqRef.current;
    requestSolve(g.bottles.map(b => [...b])).then(res => {
      if (seq !== levelSeqRef.current) return;
      setMopt(res.status === 'solved' ? res.moves : -1);
    });
  }, [resetTimer, requestSolve]);

  React.useEffect(() => { initLevel(level); }, [level, initLevel]);

  // --- Deadlock detection ---
  React.useEffect(() => {
    if (!bottles.length || !revealed.length || showWin) { setDeadlock(false); return; }
    if (isWinCondition(bottles, revealed)) { setDeadlock(false); return; }
    setDeadlock(isDeadlocked(bottles, revealed));
  }, [bottles, revealed, showWin]);

  // Latest board, used to discard async hint results after the board moved
  const bottlesRef = React.useRef(bottles);
  bottlesRef.current = bottles;

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

    if (canPour(bottles, selected, idx, revealed)) {
      setHistory(h => [...h, {
        bottles: bottles.map(b => [...b]),
        revealed: revealed.map(r => [...r]),
        moves,
      }]);
      setMoves(m => m + 1);
      play(soundPour);

      // Cosmetic pour animation: record what moved, clear after it plays.
      setLastPour({
        from: selected,
        to: idx,
        count: pourCount(bottles, selected, idx, revealed),
        color: topColor(bottles[selected]),
        dir: idx > selected ? 1 : -1,
        key: Date.now(),
      });
      clearTimeout(pourTimerRef.current);
      pourTimerRef.current = setTimeout(() => setLastPour(null), 600);

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
        saveBestStreak(ns);
        if (levelTier === 'hard') incrementHardWins();
        // When the exact optimum is unknown, rate against the lower bound:
        // never overestimates, so every level can still award stars.
        const s = starsFromMoves(totalMoves, mopt > 0 ? mopt : moptLB);
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
  }, [bottles, revealed, selected, showWin, moves, level, doShake, streak, play, mopt, moptLB, levelTier]);

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
    setLastPour(null);
    setBoardKey(k => k + 1);
  }, [history, play, undosLeft]);

  const restart = React.useCallback(() => {
    if (streak > 0) showToast("Streak reset");
    setStreak(0); saveStreak(0);
    initLevel(level);
    play(soundTap);
  }, [level, initLevel, play, streak, showToast]);

  // Hint: ask the solver for the first move of an optimal solution from the
  // current position; fall back to the scored heuristic when it can't.
  const hintPendingRef = React.useRef(false);
  const doHint = React.useCallback(() => {
    if (hintsLeft <= 0 || hintPendingRef.current) return;
    hintPendingRef.current = true;
    setHintPending(true);
    const snapshot = bottles;
    const revealedSnapshot = revealed;
    requestSolve(snapshot.map(b => [...b]), { maxNodes: 150000, timeLimitMs: 2000 }).then(res => {
      hintPendingRef.current = false;
      setHintPending(false);
      if (bottlesRef.current !== snapshot) return; // board changed meanwhile
      const h = (res.status === 'solved' && res.firstMove) ? res.firstMove : findHint(snapshot, revealedSnapshot);
      if (h) {
        setHint(h);
        setHintsLeft(n => n - 1);
        play(soundTap);
        setTimeout(() => setHint(null), 2000);
      }
    });
  }, [bottles, play, hintsLeft, requestSolve]);

  const addBottle = React.useCallback(() => {
    if (addBottlesLeft <= 0 || showWin) return;
    haptic();
    play(soundTap);
    setHistory(h => [...h, { bottles: bottles.map(b => [...b]), revealed: revealed.map(r => [...r]), moves }]);
    setBottles(b => [...b, []]);
    setRevealed(r => [...r, []]);
    setAddBottlesLeft(n => n - 1);
  }, [addBottlesLeft, bottles, revealed, moves, play, showWin]);

  const handleBgTap = React.useCallback((e) => {
    if (e.target === e.currentTarget && selected !== null) { setSelected(null); haptic(); }
  }, [selected]);

  const getGhost = React.useCallback((idx) => {
    if (selected === null || selected === idx || !canPour(bottles, selected, idx, revealed)) {
      return { count: 0, color: null };
    }
    return { count: pourCount(bottles, selected, idx, revealed), color: topColor(bottles[selected]) };
  }, [bottles, revealed, selected]);

  const nextLevel = React.useCallback(() => {
    setLevel(l => l + 1);
    haptic();
  }, []);

  // --- Derived values ---
  const doneCount = bottles.filter((b, i) => isDoneBottle(b, revealed[i])).length;
  const totalStars = React.useMemo(() => {
    let sum = 0;
    for (let i = 1; i <= maxLevel; i++) {
      sum += getBestStars(i);
    }
    return sum;
    // bestStars is a dep so the total refreshes right after a win
  }, [maxLevel, bestStars]);

  // Gameplay actions only — sound and colorblind toggles live in Settings.
  const UndoIcon = () => (
    // Two arcs with exact 180° rotational symmetry around (10,10).
    // Each covers 120° of the circle (r=7 outer / r=5.5 inner) plus a
    // triangular arrowhead. Rotating any coordinate by 180° maps it to
    // its counterpart in the other arrow.
    <svg width="28" height="28" viewBox="0 0 20 20" fill="currentColor">
      {/* Top arc body: 210°→330° clockwise (through 270° = top) */}
      <path d="M 3.9 6.5 A 7 7 0 0 1 16.1 6.5 L 14.8 7.3 A 5.5 5.5 0 0 0 5.2 7.3 Z" />
      {/* Top arrowhead — tangent at 330° points (0.5, 0.866) */}
      <path d="M 14.8 7.3 L 17.4 5.8 L 17.1 8.2 Z" />
      {/* Bottom arc body: 30°→150° clockwise (through 90° = bottom) — 180° mirror */}
      <path d="M 16.1 13.5 A 7 7 0 0 1 3.9 13.5 L 5.2 12.7 A 5.5 5.5 0 0 0 14.8 12.7 Z" />
      {/* Bottom arrowhead — tangent at 150° points (-0.5, -0.866) */}
      <path d="M 5.2 12.7 L 2.6 14.2 L 2.9 11.8 Z" />
    </svg>
  );
  const HintIcon = () => (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2a5 5 0 013.5 8.5c-.5.5-.5 1-.5 1.5H7c0-.5 0-1-.5-1.5A5 5 0 0110 2z" />
      <path d="M8 16h4M9 18h2" />
    </svg>
  );
  const HintPendingIcon = () => (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="6" cy="10" r="1.2" fill="currentColor" />
      <circle cx="10" cy="10" r="1.2" fill="currentColor" />
      <circle cx="14" cy="10" r="1.2" fill="currentColor" />
    </svg>
  );
  const RetryIcon = () => (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 10a5 5 0 11-1.5-3.5" />
      <polyline points="13,3 15.5,6.5 12,6.5" />
    </svg>
  );
  const SkipIcon = () => (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5,4 10,10 5,16" />
      <polyline points="10,4 15,10 10,16" />
    </svg>
  );
  const AddBottleIcon = () => (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 2.5h5" />
      <path d="M7.5 2.5v2.5L5 7.5v8.5a1 1 0 001 1h8a1 1 0 001-1V7.5L12.5 5V2.5" />
      <path d="M10 10v4M8 12h4" />
    </svg>
  );
  const controls = [
    { fn: undo, dis: !history.length || undosLeft <= 0, label: "UNDO", icon: <UndoIcon />, count: undosLeft },
    { fn: doHint, dis: deadlock || hintsLeft <= 0 || hintPending, label: "HINT", icon: hintPending ? <HintPendingIcon /> : <HintIcon />, count: hintsLeft, pending: hintPending },
    { fn: restart, label: "RETRY", icon: <RetryIcon /> },
    { fn: () => { setLevel(l => l + 1); haptic(); }, label: "SKIP", icon: <SkipIcon /> },
    { fn: addBottle, dis: addBottlesLeft <= 0 || showWin, label: "ADD", icon: <AddBottleIcon />, count: addBottlesLeft },
  ];

  // --- Render ---
  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden select-none"
      style={{
        background: (() => {
          const bg = BACKGROUNDS.find(b => b.id === backgroundId) || BACKGROUNDS[0];
          if (bg.url) return `url(${bg.url}) center/cover no-repeat`;
          if (bg.id === 'default') return `radial-gradient(120% 80% at 50% 0%, #131a55 0%, transparent 55%), linear-gradient(180deg, ${bg.colors[0]}, ${bg.colors[1]} 55%, ${bg.colors[2]})`;
          return `linear-gradient(160deg, ${bg.colors[0]}, ${bg.colors[1]} 50%, ${bg.colors[2]})`;
        })(),
        touchAction: "manipulation",
        overscrollBehavior: "none",
        WebkitUserSelect: "none",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <Stars decor={!(BACKGROUNDS.find(b => b.id === backgroundId)?.url)} />

      <HomeScreen
        show={showHome}
        level={level}
        totalStars={totalStars}
        streak={streak}
        difficulty={difficulty}
        onPlay={() => {
          setShowHome(false);
          haptic();
          play(soundTap);
          if (!getTutorialSeen()) {
            setShowTutorial(true);
            saveTutorialSeen();
          }
        }}
        onOpenMap={() => {
          setShowHome(false);
          setShowMap(true);
        }}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAchievements={() => setShowAchievements(true)}
      />

      <Header
        level={level}
        moves={moves}
        bestStars={bestStars}
        best={best}
        streak={streak}
        difficulty={levelTier}
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
        boardKey={boardKey}
        lastPour={lastPour}
        onUndo={undo}
        onRestart={restart}
        canUndo={history.length > 0 && undosLeft > 0}
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
        onReplay={restart}
        onOpenMap={() => setShowMap(true)}
      />

      <LevelMap
        show={showMap}
        onClose={() => setShowMap(false)}
        currentLevel={level}
        maxLevel={maxLevel}
        onSelectLevel={n => {
          if (streak > 0 && n !== level) showToast("Streak reset");
          setStreak(0); saveStreak(0); setLevel(n); setShowMap(false); haptic();
        }}
      />

      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        difficulty={difficulty}
        onChangeDifficulty={(tier) => {
          setDifficulty(tier);
          saveDifficulty(tier);
          difficultyRef.current = tier;
        }}
        backgroundId={backgroundId}
        onChangeBackground={(id) => {
          setBackgroundId(id);
          saveBackground(id);
        }}
        muted={muted}
        onToggleMuted={() => setMuted(m => { saveMuted(!m); return !m; })}
        patMode={patMode}
        onTogglePatMode={() => setPatMode(p => { savePatternMode(!p); return !p; })}
        onOpenAchievements={() => { setShowSettings(false); setShowAchievements(true); }}
        onOpenTutorial={() => { setShowSettings(false); setShowTutorial(true); }}
      />

      <AchievementsScreen
        show={showAchievements}
        onClose={() => setShowAchievements(false)}
      />

      <Tutorial
        show={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      <Toast message={toast} />
    </div>
  );
}
