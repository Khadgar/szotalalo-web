import { describe, it, expect } from 'vitest';
import { Trie } from './Trie';
import { findPathForWord, findWords } from './solver';

describe('solver', () => {
  const grid = [
    ['a', 'l', 'm'],
    ['k', 'o', 'a'],
    ['t', 'm', 's'],
  ];
  const dict = Trie.from(['alma', 'oka', 'mama', 'ok', 'kos', 'sok']);

  it('finds words on the grid', () => {
    const words = findWords(grid, dict);
    expect(words).toEqual(expect.arrayContaining(['alma', 'oka']));
    // 'mama' not reachable: only one 'm' adjacency works oddly, ensure no false positive of revisit
  });

  it('returns a valid path for a word', () => {
    const path = findPathForWord(grid, 'alma');
    expect(path).not.toBeNull();
    expect(path!.map((p) => grid[p.i][p.j]).join('')).toBe('alma');
    // adjacency check
    for (let i = 1; i < path!.length; i++) {
      const a = path![i - 1];
      const b = path![i];
      expect(Math.max(Math.abs(a.i - b.i), Math.abs(a.j - b.j))).toBe(1);
    }
  });

  it('returns null for an unreachable word', () => {
    expect(findPathForWord(grid, 'xyz')).toBeNull();
  });
});
