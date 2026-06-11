// One-time script: generates public/dict_en.txt by trimming
// `an-array-of-english-words` to match the size of the Hungarian dictionary.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import words from 'an-array-of-english-words' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const huPath = path.join(repoRoot, 'public', 'dict_hu.txt');
const enPath = path.join(repoRoot, 'public', 'dict_en.txt');

const huCount = fs
  .readFileSync(huPath, 'utf8')
  .split(/\r?\n/)
  .filter((l) => l.trim().length > 0).length;

const cleaned = words
  .map((w) => w.toLowerCase().trim())
  .filter((w) => /^[a-z]+$/.test(w) && w.length >= 2);

const unique = Array.from(new Set(cleaned)).sort();
const trimmed = unique.slice(0, huCount);

fs.writeFileSync(enPath, trimmed.join('\n') + '\n', 'utf8');
console.log(`Wrote ${trimmed.length.toLocaleString()} words to ${enPath}`);
console.log(`(Hungarian dict has ${huCount.toLocaleString()} entries)`);
