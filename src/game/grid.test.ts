import { describe, it, expect } from 'vitest';
import { emptyGrid, randomGrid } from './grid';

describe('grid', () => {
  it('emptyGrid produces N x N empty strings', () => {
    const g = emptyGrid(5);
    expect(g).toHaveLength(5);
    expect(g[0]).toHaveLength(5);
    expect(g.flat().every((c) => c === '')).toBe(true);
  });

  it('randomGrid (hu) produces valid Hungarian letters', () => {
    const g = randomGrid(4, 'hu');
    expect(g).toHaveLength(4);
    expect(g[0]).toHaveLength(4);
    const valid = /^[a-záéíóöőúüű]$/;
    expect(g.flat().every((c) => valid.test(c))).toBe(true);
  });

  it('randomGrid (en) produces valid English letters', () => {
    const g = randomGrid(4, 'en');
    const valid = /^[a-z]$/;
    expect(g.flat().every((c) => valid.test(c))).toBe(true);
  });
});
