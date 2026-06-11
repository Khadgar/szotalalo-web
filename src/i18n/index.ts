/**
 * i18next bootstrap.
 *
 * Language detection order: `?lang=` querystring → localStorage → browser
 * `navigator.language` → <html lang>. The resolved language is cached in
 * localStorage so it survives reloads.
 *
 * Side effect: keeps document.documentElement.lang in sync with the active
 * language so screen readers and CSS `:lang()` selectors behave correctly.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import hu from './hu.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hu: { translation: hu },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hu'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupQuerystring: 'lang',
    },
  });

const syncHtmlLang = (lng: string) => {
  if (typeof document !== 'undefined') document.documentElement.lang = lng;
};
syncHtmlLang(i18n.resolvedLanguage ?? i18n.language ?? 'en');
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
