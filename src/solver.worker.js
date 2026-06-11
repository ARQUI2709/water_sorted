// Web Worker wrapper around the BFS solver: keeps the search off the main
// thread so big levels never freeze the UI. Messages are correlated by id.
import { solveBFS } from './solver.js';

self.onmessage = (e) => {
  const { id, bottles, cap, options } = e.data;
  const result = solveBFS(bottles, cap, options);
  self.postMessage({ id, result });
};
