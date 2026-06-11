import { describe, it, expect } from 'vitest';
import { solveBFS, starsFromMoves, movesLowerBound } from './solver.js';
import { generateLevel } from './game.js';

const CAP = 4;

describe('solveBFS', () => {
  it('returns 0 moves for an already solved state', () => {
    const res = solveBFS([[0, 0, 0, 0], [1, 1, 1, 1], []], CAP);
    expect(res).toEqual({ status: 'solved', moves: 0, firstMove: null });
  });

  it('finds the known optimum for a simple merge puzzle', () => {
    // One color split across four bottles: three merges needed.
    const res = solveBFS([[0], [0], [0], [0]], CAP);
    expect(res.status).toBe('solved');
    expect(res.moves).toBe(3);
    expect(res.firstMove).toHaveProperty('from');
    expect(res.firstMove).toHaveProperty('to');
  });

  it('reports a valid first move of an optimal solution', () => {
    const res = solveBFS([[0, 0, 1, 1], [1, 1, 0, 0], []], CAP);
    expect(res.status).toBe('solved');
    expect(res.moves).toBeGreaterThan(0);
    // The first move must at least be a legal pour target (empty bottle here)
    expect(res.firstMove.to).toBe(2);
  });

  it('distinguishes a truly unsolvable state from an exhausted budget', () => {
    // Two full bottles with mismatched tops and no free space: no moves at all.
    const stuck = solveBFS([[0, 1, 0, 1], [1, 0, 1, 0]], CAP);
    expect(stuck.status).toBe('unsolvable');

    const big = generateLevel(40, 'hard');
    const capped = solveBFS(big.bottles, CAP, { maxNodes: 50 });
    expect(capped.status).toBe('budget');
  });
});

describe('movesLowerBound', () => {
  it('is zero for solved or empty states', () => {
    expect(movesLowerBound([[0, 0, 0, 0], []])).toBe(0);
    expect(movesLowerBound([])).toBe(0);
  });

  it('counts color runs above one per color', () => {
    // 4 runs, 2 colors -> at least 2 moves
    expect(movesLowerBound([[0, 0, 1, 1], [1, 1, 0, 0], []])).toBe(2);
  });

  it('never exceeds the true optimum on solvable levels', () => {
    for (let i = 0; i < 5; i++) {
      const g = generateLevel(6, 'normal');
      const res = solveBFS(g.bottles, CAP);
      expect(res.status).toBe('solved');
      expect(movesLowerBound(g.bottles)).toBeLessThanOrEqual(res.moves);
    }
  });
});

describe('starsFromMoves', () => {
  it('returns 0 when the optimum is unknown', () => {
    expect(starsFromMoves(10, 0)).toBe(0);
    expect(starsFromMoves(10, -1)).toBe(0);
  });

  it('grades against the optimum with tolerance bands', () => {
    expect(starsFromMoves(10, 10)).toBe(3);  // optimal
    expect(starsFromMoves(13, 10)).toBe(3);  // within +ceil(10%)+2
    expect(starsFromMoves(14, 10)).toBe(2);  // within +ceil(25%)+5
    expect(starsFromMoves(18, 10)).toBe(2);
    expect(starsFromMoves(19, 10)).toBe(1);  // completed, far from optimal
  });
});
