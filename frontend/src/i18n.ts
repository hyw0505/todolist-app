import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import koTranslation from './locales/ko/translation.json';
import enTranslation from './locales/en/translation.json';
import jpTranslation from './locales/jp/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: koTranslation },
      en: { translation: enTranslation },
      jp: { translation: jpTranslation },
    },
    fallbackLng: 'ko',
    supportedLngs: ['ko', 'en', 'jp'],
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
