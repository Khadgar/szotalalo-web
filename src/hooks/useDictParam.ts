import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { DictLang } from '../dict/loadDict';

const isLang = (s: string | null | undefined): s is DictLang => s === 'hu' || s === 'en';

/**
 * Reads & writes the `?dict=hu|en` query param.
 * Falls back to the current i18n language (or 'en') when the param is missing.
 */
export function useDictParam(): [DictLang, (d: DictLang) => void] {
  const [params, setParams] = useSearchParams();
  const { i18n } = useTranslation();
  const fallback: DictLang = i18n.resolvedLanguage === 'hu' ? 'hu' : 'en';
  const raw = params.get('dict');
  const current: DictLang = isLang(raw) ? raw : fallback;

  const set = useCallback(
    (d: DictLang) => {
      const next = new URLSearchParams(params);
      next.set('dict', d);
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  return [current, set];
}
