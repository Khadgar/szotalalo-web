import { describe, it, expect } from 'vitest';
import { Trie } from './Trie';

describe('Trie', () => {
  it('inserts and searches words', () => {
    const t = Trie.from(['alma', 'alom', 'asz']);
    expect(t.search('alma')).toBe(true);
    expect(t.search('alom')).toBe(true);
    expect(t.search('al')).toBe(false);
    expect(t.search('almafa')).toBe(false);
  });

  it('detects valid prefixes', () => {
    const t = Trie.from(['alma', 'asztal']);
    expect(t.isValidPrefix('a')).toBe(true);
    expect(t.isValidPrefix('al')).toBe(true);
    expect(t.isValidPrefix('asz')).toBe(true);
    expect(t.isValidPrefix('bz')).toBe(false);
  });

  it('handles Hungarian characters', () => {
    const t = Trie.from(['ős', 'ősz']);
    expect(t.search('ős')).toBe(true);
    expect(t.search('ősz')).toBe(true);
    expect(t.isValidPrefix('ő')).toBe(true);
  });
});
