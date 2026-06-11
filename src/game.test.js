import { describe, it, expect } from 'vitest';
import {
  numColorsForLevel, numEmptyBottles, hiddenSegmentsForLevel,
  generateLevel, canPour, pour, pourCount,
  isWinCondition, isDeadlocked, findHint,
} from './game.js';
import { BOTTLE_CAPACITY } from './constants.js';
import { solveBFS } from './solver.js';

describe('level scaling', () => {
  it('grows colors with level and caps band 1 at 12', () => {
    expect(numColorsForLevel(1)).toBe(3);
    expect(numColorsForLevel(19)).toBe(12);
    expect(numColorsForLevel(20)).toBe(13);
    expect(numColorsForLevel(25)).toBe(14);
  });

  it('gives more empty bottles on easier tiers', () => {
    const n = 3;
    expect(numEmptyBottles(n, 'hard')).toBeLessThan(numEmptyBottles(n, 'easy'));
    expect(numEmptyBottles(n, 'normal')).toBeGreaterThanOrEqual(numEmptyBottles(n, 'hard'));
  });

  it('introduces hidden segments from level 30, capped at CAP-1', () => {
    expect(hiddenSegmentsForLevel(29)).toBe(0);
    expect(hiddenSegmentsForLevel(30)).toBe(1);
    expect(hiddenSegmentsForLevel(100)).toBe(BOTTLE_CAPACITY - 1);
  });
});

describe('generateLevel', () => {
  it('conserves exactly CAP segments of each color', () => {
    for (const level of [1, 7, 25]) {
      const g = generateLevel(level, 'normal');
      const counts = {};
      for (const b of g.bottles) for (const s of b) counts[s] = (counts[s] || 0) + 1;
      expect(Object.keys(counts).length).toBe(g.numColors);
      for (let c = 0; c < g.numColors; c++) expect(counts[c]).toBe(BOTTLE_CAPACITY);
      expect(g.bottles.length).toBe(g.numColors + g.numEmpty);
    }
  });

  it('never starts with a pre-completed bottle', () => {
    for (let i = 0; i < 20; i++) {
      const g = generateLevel(5, 'normal');
      const completed = g.bottles.some(
        b => b.length === BOTTLE_CAPACITY && b.every(s => s === b[0]),
      );
      expect(completed).toBe(false);
    }
  });

  it('generates solvable levels (verified by BFS on small sizes)', () => {
    for (const level of [1, 3, 6, 9]) {
      for (let i = 0; i < 5; i++) {
        const g = generateLevel(level, 'hard');
        const res = solveBFS(g.bottles, BOTTLE_CAPACITY);
        expect(res.status).toBe('solved');
        expect(res.moves).toBeGreaterThan(0);
        expect(res.moves).toBeLessThanOrEqual(g.movesUpperBound);
      }
    }
  });

  it('builds a revealed mask matching hiddenCount', () => {
    const open = generateLevel(1, 'normal');
    expect(open.hiddenCount).toBe(0);
    expect(open.revealed.flat().every(Boolean)).toBe(true);

    const hidden = generateLevel(35, 'normal');
    expect(hidden.hiddenCount).toBeGreaterThan(0);
    hidden.bottles.forEach((bottle, bi) => {
      bottle.forEach((_, si) => {
        expect(hidden.revealed[bi][si]).toBe(si >= hidden.hiddenCount);
      });
    });
  });
});

describe('pouring rules', () => {
  const B = (...bottles) => bottles.map(b => [...b]);

  it('allows pouring only onto same color or empty', () => {
    const bottles = B([0, 0], [1, 1], []);
    expect(canPour(bottles, 0, 1)).toBe(false);
    expect(canPour(bottles, 0, 2)).toBe(true);
    expect(canPour(bottles, 0, 0)).toBe(false);
  });

  it('refuses to move a completed bottle into an empty one', () => {
    const bottles = B([0, 0, 0, 0], []);
    expect(canPour(bottles, 0, 1)).toBe(false);
  });

  it('pours the full top run up to available space', () => {
    const bottles = B([1, 0, 0, 0], [0]);
    expect(pourCount(bottles, 0, 1)).toBe(3);
    const revealed = bottles.map(b => b.map(() => true));
    const r = pour(bottles, revealed, 0, 1);
    expect(r.bottles[0]).toEqual([1]);
    expect(r.bottles[1]).toEqual([0, 0, 0, 0]);
  });

  it('reveals the uncovered top of the source bottle', () => {
    const bottles = B([0, 1], []);
    const revealed = [[false, true], []];
    const r = pour(bottles, revealed, 0, 1);
    expect(r.bottles[0]).toEqual([0]);
    expect(r.revealed[0]).toEqual([true]);
  });
});

describe('win and deadlock detection', () => {
  it('detects the win condition only when every segment is revealed', () => {
    const bottles = [[0, 0, 0, 0], []];
    expect(isWinCondition(bottles, [[true, true, true, true], []])).toBe(true);
    expect(isWinCondition(bottles, [[false, true, true, true], []])).toBe(false);
  });

  it('detects deadlocks', () => {
    expect(isDeadlocked([[0, 1, 0, 1], [1, 0, 1, 0]])).toBe(true);
    expect(isDeadlocked([[0, 1, 0, 1], [1, 0, 1, 0], []])).toBe(false);
  });
});

describe('findHint heuristic', () => {
  it('prefers the move that completes a bottle', () => {
    // Pouring 0 -> 1 completes bottle 1; bottle 2 is an empty distraction.
    const bottles = [[1, 1, 0], [0, 0, 0], [], [1]];
    const hint = findHint(bottles);
    expect(hint).toEqual({ from: 0, to: 1 });
  });

  it('avoids relocating a single-color bottle into an empty one when there are alternatives', () => {
    // 0 -> 2 is a null move (single-color into empty); 1 -> 0 consolidates.
    const bottles = [[0, 0], [1, 0], []];
    const hint = findHint(bottles);
    expect(hint).toEqual({ from: 1, to: 0 });
  });
});
