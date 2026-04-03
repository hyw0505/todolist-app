import { create } from 'zustand';
import i18n from '@/i18n';

export type Language = 'ko' | 'en' | 'jp';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

const STORAGE_KEY = 'i18nextLng';

const getInitialLanguage = (): Language => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored === 'ko' || stored === 'en' || stored === 'jp') {
      return stored;
    }
  } catch {
    // SSR 또는 접근 불가 환경
  }
  return 'ko';
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (newLanguage: Language) => {
    localStorage.setItem(STORAGE_KEY, newLanguage);
    void i18n.changeLanguage(newLanguage);
    set({ language: newLanguage });
  },
}));
