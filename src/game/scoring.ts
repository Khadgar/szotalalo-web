/**
 * Classic Boggle scoring by word length (Unicode codepoint count, so accented
 * Hungarian letters count as one character each):
 *   3-4 → 1, 5 → 2, 6 → 3, 7 → 5, 8+ → 11. Anything shorter scores 0.
 */
export function scoreWord(word: string): number {
  const len = [...word].length;
  if (len <= 2) return 0;
  if (len <= 4) return 1;
  if (len === 5) return 2;
  if (len === 6) return 3;
  if (len === 7) return 5;
  return 11;
}

export function totalScore(words: string[]): number {
  return words.reduce((acc, w) => acc + scoreWord(w), 0);
}
