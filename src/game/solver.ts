/**
 * Boggle board solver.
 *
 * `findWords`        — enumerate every dictionary word reachable on the grid.
 * `findPathForWord`  — given a known word, return one cell path that spells it.
 *
 * Both walk all 8 neighbours (horizontal/vertical/diagonal) without revisiting
 * cells. `findWords` prunes branches whose current prefix isn't in the Trie.
 *
 * Letters are normalised with Hungarian locale lowercasing so that "Á" and "á"
 * compare equal; this also matches how the dictionary file is loaded.
 */
import { Trie } from './Trie';

export type Coord = { i: number; j: number };
export type Grid = string[][];

const lower = (s: string) => s.toLocaleLowerCase('hu-HU');

/** Find every dictionary word reachable on the boggle grid. */
export function findWords(grid: Grid, dict: Trie): string[] {
  const M = grid.length;
  if (M === 0) return [];
  const N = grid[0].length;
  const visited: boolean[][] = Array.from({ length: M }, () => new Array(N).fill(false));
  const found = new Set<string>();

  const dfs = (i: number, j: number, prefix: string) => {
    visited[i][j] = true;
    const next = prefix + lower(grid[i][j]);
    if (next.length >= 2 && dict.search(next)) found.add(next);
    // Only keep walking if some longer word still starts with `next`.
    if (dict.isValidPrefix(next)) {
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) continue;
          const ni = i + di;
          const nj = j + dj;
          if (ni < 0 || nj < 0 || ni >= M || nj >= N) continue;
          if (visited[ni][nj]) continue;
          dfs(ni, nj, next);
        }
      }
    }
    visited[i][j] = false;
  };

  for (let i = 0; i < M; i++) {
    for (let j = 0; j < N; j++) {
      if (lower(grid[i][j])) dfs(i, j, '');
    }
  }

  return Array.from(found);
}

/**
 * Return one valid path of cells that spells `word`, or null if unreachable.
 * Used by the solver UI to animate how a clicked word lays out on the board,
 * and by GamePlay to verify a swiped word is actually traceable.
 */
export function findPathForWord(grid: Grid, word: string): Coord[] | null {
  const target = lower(word);
  const M = grid.length;
  if (M === 0) return null;
  const N = grid[0].length;
  const visited: boolean[][] = Array.from({ length: M }, () => new Array(N).fill(false));

  const dfs = (i: number, j: number, idx: number, path: Coord[]): Coord[] | null => {
    if (lower(grid[i][j]) !== target[idx]) return null;
    visited[i][j] = true;
    path.push({ i, j });
    if (idx === target.length - 1) return [...path];
    for (let di = -1; di <= 1; di++) {
      for (let dj = -1; dj <= 1; dj++) {
        if (di === 0 && dj === 0) continue;
        const ni = i + di;
        const nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= M || nj >= N) continue;
        if (visited[ni][nj]) continue;
        const found = dfs(ni, nj, idx + 1, path);
        if (found) {
          visited[i][j] = false;
          path.pop();
          return found;
        }
      }
    }
    visited[i][j] = false;
    path.pop();
    return null;
  };

  for (let i = 0; i < M; i++) {
    for (let j = 0; j < N; j++) {
      const result = dfs(i, j, 0, []);
      if (result) return result;
    }
  }
  return null;
}
