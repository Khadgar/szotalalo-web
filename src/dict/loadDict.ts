/**
 * Per-language dictionary loader.
 *
 * Dictionaries are plain text files (one word per line) shipped in /public:
 *   - dict_hu.txt  (~71k Hungarian words)
 *   - dict_en.txt  (~71k English words)
 *
 * On first request we fetch the file, build a Trie, and cache it for the
 * lifetime of the page. Concurrent callers share the same in-flight Promise.
 *
 * `useDict(lang)` is the React-friendly wrapper that exposes
 * `{ trie, loading, error }` and re-runs when the language changes.
 */
import { useEffect, useState } from 'react';
import { Trie } from '../game/Trie';

export type DictLang = 'hu' | 'en';

const cache: Partial<Record<DictLang, Trie>> = {};
const inflight: Partial<Record<DictLang, Promise<Trie>>> = {};

/**
 * Fetch + parse the dictionary for `lang`, caching the resulting Trie.
 * Returns the cached Trie on subsequent calls, or the in-flight Promise if
 * another caller is already loading the same language.
 */
export function loadDict(lang: DictLang): Promise<Trie> {
  if (cache[lang]) return Promise.resolve(cache[lang]!);
  if (inflight[lang]) return inflight[lang]!;
  const url = `${import.meta.env.BASE_URL}dict_${lang}.txt`;
  const p = fetch(url).then(async (res) => {
    if (!res.ok) throw new Error(`Failed to load ${lang} dictionary: ${res.status}`);
    const text = await res.text();
    const trie = new Trie();
    // Hungarian needs locale-aware lowercasing (e.g. İ → i).
    const lower = lang === 'hu' ? (s: string) => s.toLocaleLowerCase('hu-HU') : (s: string) => s.toLowerCase();
    for (const line of text.split(/\r?\n/)) {
      const w = lower(line.trim());
      if (w) trie.insert(w);
    }
    cache[lang] = trie;
    return trie;
  });
  inflight[lang] = p;
  // Failed loads must clear inflight so a retry can fire a fresh request.
  p.catch(() => {
    delete inflight[lang];
  });
  return p;
}

export interface DictState {
  trie: Trie | null;
  loading: boolean;
  error: string | null;
}

/**
 * React hook around `loadDict`. Returns the cached Trie immediately if
 * available; otherwise reports loading=true until the fetch resolves.
 * Safe against unmount / language-change races via the `cancelled` flag.
 */
export function useDict(lang: DictLang): DictState {
  const [state, setState] = useState<DictState>(() => ({
    trie: cache[lang] ?? null,
    loading: !cache[lang],
    error: null,
  }));

  useEffect(() => {
    let cancelled = false;
    if (cache[lang]) {
      setState({ trie: cache[lang]!, loading: false, error: null });
      return;
    }
    setState({ trie: null, loading: true, error: null });
    loadDict(lang)
      .then((t) => !cancelled && setState({ trie: t, loading: false, error: null }))
      .catch(
        (e) =>
          !cancelled &&
          setState({ trie: null, loading: false, error: String(e?.message ?? e) }),
      );
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return state;
}
