import { describe, it, expect, beforeEach } from 'vitest';
import {
  migrateStorage,
  getBestMoves, saveBestMoves, getBestStars, saveBestStars,
  getStreak, saveStreak, getBestStreak, saveBestStreak,
  getHardWins, incrementHardWins,
  getSavedLevel, saveLevel, getMaxLevel, saveMaxLevel,
} from './storage.js';

// Minimal localStorage shim for the node test environment
function makeLocalStorage() {
  let store = new Map();
  return {
    get length() { return store.size; },
    key: (i) => [...store.keys()][i] ?? null,
    getItem: (k) => store.has(k) ? store.get(k) : null,
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); },
    clear: () => { store = new Map(); },
  };
}

beforeEach(() => {
  globalThis.localStorage = makeLocalStorage();
});

describe('max level vs current level', () => {
  it('never decreases when an earlier level is replayed', () => {
    saveLevel(50);
    saveMaxLevel(50);
    // Player goes back to level 3 from the map
    saveLevel(3);
    saveMaxLevel(3);
    expect(getSavedLevel()).toBe(3);
    expect(getMaxLevel()).toBe(50);
  });

  it('falls back to the current level when never saved', () => {
    saveLevel(7);
    expect(getMaxLevel()).toBe(7);
  });
});

describe('best records', () => {
  it('keeps the lowest move count per level', () => {
    saveBestMoves(4, 20);
    saveBestMoves(4, 25);
    expect(getBestMoves(4)).toBe(20);
    saveBestMoves(4, 15);
    expect(getBestMoves(4)).toBe(15);
  });

  it('keeps the highest star count per level', () => {
    saveBestStars(4, 2);
    saveBestStars(4, 1);
    expect(getBestStars(4)).toBe(2);
  });

  it('only raises the best streak', () => {
    saveStreak(3);
    saveBestStreak(3);
    saveStreak(0);
    saveBestStreak(0);
    expect(getStreak()).toBe(0);
    expect(getBestStreak()).toBe(3);
  });

  it('accumulates hard wins', () => {
    expect(getHardWins()).toBe(0);
    incrementHardWins();
    incrementHardWins();
    expect(getHardWins()).toBe(2);
  });
});

describe('migrateStorage', () => {
  it('copies legacy un-namespaced keys to the wsp: prefix', () => {
    localStorage.setItem('wsp_level', '12');
    localStorage.setItem('wb5', '18');
    localStorage.setItem('wstar5', '3');
    localStorage.setItem('wbeststreak', '7');
    localStorage.setItem('wdiff', 'hard');

    migrateStorage();

    expect(getSavedLevel()).toBe(12);
    expect(getBestMoves(5)).toBe(18);
    expect(getBestStars(5)).toBe(3);
    expect(getBestStreak()).toBe(7);
    expect(localStorage.getItem('wsp:wdiff')).toBe('hard');
    // Legacy keys are left in place (cheap, and safe on rollback)
    expect(localStorage.getItem('wb5')).toBe('18');
  });

  it('recovers progress lost to the replay bug from per-level records', () => {
    // The old build rewound wsp_level to 3 on replay, but records up to
    // level 49 prove the player reached at least level 50.
    localStorage.setItem('wsp_level', '3');
    localStorage.setItem('wb49', '31');
    localStorage.setItem('wstar20', '2');

    migrateStorage();

    expect(getSavedLevel()).toBe(3);
    expect(getMaxLevel()).toBe(50);
  });

  it('runs only once', () => {
    localStorage.setItem('wsp_level', '5');
    migrateStorage();
    saveLevel(9);
    localStorage.setItem('wsp_level', '99'); // stale legacy key must be ignored
    migrateStorage();
    expect(getSavedLevel()).toBe(9);
  });

  it('is a no-op for brand new players', () => {
    migrateStorage();
    expect(getSavedLevel()).toBe(1);
    expect(getMaxLevel()).toBe(1);
  });
});
