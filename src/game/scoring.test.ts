import { describe, it, expect } from 'vitest';
import { scoreWord, totalScore } from './scoring';

describe('scoring', () => {
  it('scores by length boundaries', () => {
    expect(scoreWord('ab')).toBe(0);
    expect(scoreWord('abc')).toBe(1);
    expect(scoreWord('abcd')).toBe(1);
    expect(scoreWord('abcde')).toBe(2);
    expect(scoreWord('abcdef')).toBe(3);
    expect(scoreWord('abcdefg')).toBe(5);
    expect(scoreWord('abcdefgh')).toBe(11);
    expect(scoreWord('abcdefghi')).toBe(11);
  });

  it('handles Hungarian characters as single codepoints', () => {
    expect(scoreWord('őszi')).toBe(1); // 4 chars
    expect(scoreWord('árvíz')).toBe(2); // 5 chars
  });

  it('sums totals', () => {
    expect(totalScore(['abc', 'abcde', 'abcdefgh'])).toBe(1 + 2 + 11);
  });
});
