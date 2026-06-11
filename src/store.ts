/**
 * Global Zustand store.
 *
 * Two independent slices share one store for simplicity:
 *   - `solver`: editable grid + last solve results + currently selected word/path
 *   - `game`:   active match — config, generated grid, players, timer, status
 *
 * The `game.status` field drives navigation between /game, /game/play and
 * /game/finished (see GameGuard in router.tsx). Timer ticks come from a
 * setInterval in GamePlay; advancePlayer ends the match when no players remain.
 */
import { create } from 'zustand';
import type { Coord, Grid } from './game/solver';
import { emptyGrid, randomGrid } from './game/grid';
import type { DictLang } from './dict/loadDict';

export type GameStatus = 'setup' | 'playing' | 'finished';
export type TimeLimit = 120 | 180 | 240 | 300 | 0; // 0 = unlimited

export interface Player {
  name: string;
  words: string[];
}

export interface GameConfig {
  playerNames: string[];
  size: number;
  timeLimit: TimeLimit;
  dictionary: DictLang;
}

interface State {
  solver: {
    size: number;
    grid: Grid;
    words: string[];
    selectedWord: string | null;
    selectedPath: Coord[] | null;
    dict: DictLang;
  };

  game: {
    status: GameStatus;
    config: GameConfig | null;
    grid: Grid;
    players: Player[];
    currentPlayer: number;
    timeLeft: number;
  };

  setSolverDict: (d: DictLang) => void;
  setSolverSize: (n: number) => void;
  setSolverCell: (i: number, j: number, ch: string) => void;
  setSolverWords: (w: string[]) => void;
  selectWord: (w: string | null, path: Coord[] | null) => void;

  startGame: (cfg: GameConfig) => void;
  addFoundWord: (w: string) => void;
  tickTimer: () => void;
  advancePlayer: () => void;
  resetGame: () => void;
}

export const useStore = create<State>((set, get) => ({
  solver: {
    size: 4,
    grid: emptyGrid(4),
    words: [],
    selectedWord: null,
    selectedPath: null,
    dict: 'en',
  },

  game: {
    status: 'setup',
    config: null,
    grid: [],
    players: [],
    currentPlayer: 0,
    timeLeft: 0,
  },

  setSolverDict: (d) =>
    set((s) => ({
      solver: { ...s.solver, dict: d, words: [], selectedWord: null, selectedPath: null },
    })),

  setSolverSize: (n) =>
    set((s) => ({
      solver: {
        ...s.solver,
        size: n,
        grid: emptyGrid(n),
        words: [],
        selectedWord: null,
        selectedPath: null,
      },
    })),

  setSolverCell: (i, j, ch) =>
    set((s) => {
      const grid = s.solver.grid.map((row) => row.slice());
      grid[i][j] = ch;
      return {
        solver: { ...s.solver, grid, words: [], selectedWord: null, selectedPath: null },
      };
    }),

  setSolverWords: (words) =>
    set((s) => ({ solver: { ...s.solver, words, selectedWord: null, selectedPath: null } })),

  selectWord: (w, path) =>
    set((s) => ({ solver: { ...s.solver, selectedWord: w, selectedPath: path } })),

  startGame: (cfg) =>
    set({
      game: {
        status: 'playing',
        config: cfg,
        grid: randomGrid(cfg.size, cfg.dictionary),
        players: cfg.playerNames.map((name) => ({ name, words: [] })),
        currentPlayer: 0,
        timeLeft: cfg.timeLimit,
      },
    }),

  addFoundWord: (w) =>
    set((s) => {
      const players = s.game.players.map((p, idx) =>
        idx === s.game.currentPlayer ? { ...p, words: [...p.words, w] } : p,
      );
      return { game: { ...s.game, players } };
    }),

  tickTimer: () =>
    set((s) => {
      if (s.game.status !== 'playing' || s.game.config?.timeLimit === 0) return {};
      const next = s.game.timeLeft - 1;
      if (next <= 0) {
        get().advancePlayer();
        return {};
      }
      return { game: { ...s.game, timeLeft: next } };
    }),

  advancePlayer: () =>
    set((s) => {
      const nextIdx = s.game.currentPlayer + 1;
      if (nextIdx >= s.game.players.length) {
        return { game: { ...s.game, status: 'finished' } };
      }
      return {
        game: {
          ...s.game,
          currentPlayer: nextIdx,
          timeLeft: s.game.config?.timeLimit ?? 0,
        },
      };
    }),

  resetGame: () =>
    set({
      game: {
        status: 'setup',
        config: null,
        grid: [],
        players: [],
        currentPlayer: 0,
        timeLeft: 0,
      },
    }),
}));
