/**
 * Random grid generation, weighted by per-language letter frequency so the
 * boards are playable (not full of Q's and Z's).
 *
 * Each cell is a single character — digraphs (Cs, Sz, Gy, …) are intentionally
 * unsupported to keep the swipe UI 1 cell = 1 letter.
 */
import type { Grid } from './solver';
import type { DictLang } from '../dict/loadDict';

/**
 * Hungarian letter frequency weights (approximate, single-character only).
 */
const HU_WEIGHTS: Array<[string, number]> = [
  ['e', 105], ['a', 94], ['t', 75], ['l', 65], ['n', 60], ['s', 57], ['k', 55],
  ['o', 50], ['r', 49], ['i', 47], ['m', 42], ['z', 38], ['g', 32], ['á', 31],
  ['é', 30], ['b', 25], ['d', 22], ['y', 22], ['v', 21], ['h', 18], ['j', 16],
  ['f', 12], ['ö', 11], ['ó', 10], ['ü', 9], ['p', 9], ['ú', 7], ['c', 7],
  ['í', 6], ['ő', 6], ['ű', 4], ['u', 4],
];

/**
 * English letter frequency (Norvig-style, integer-scaled).
 */
const EN_WEIGHTS: Array<[string, number]> = [
  ['e', 127], ['t', 91], ['a', 82], ['o', 75], ['i', 70], ['n', 67], ['s', 63],
  ['h', 61], ['r', 60], ['d', 43], ['l', 40], ['c', 28], ['u', 28], ['m', 24],
  ['w', 24], ['f', 22], ['g', 20], ['y', 20], ['p', 19], ['b', 15], ['v', 10],
  ['k', 8], ['j', 2], ['x', 2], ['q', 1], ['z', 1],
];

const WEIGHTS: Record<DictLang, Array<[string, number]>> = { hu: HU_WEIGHTS, en: EN_WEIGHTS };

function pick(weights: Array<[string, number]>): string {
  const total = weights.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [ch, w] of weights) {
    r -= w;
    if (r <= 0) return ch;
  }
  return weights[0][0];
}

export function randomGrid(size: number, lang: DictLang = 'hu'): Grid {
  const w = WEIGHTS[lang];
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => pick(w)),
  );
}

export function emptyGrid(size: number): Grid {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ''));
}
