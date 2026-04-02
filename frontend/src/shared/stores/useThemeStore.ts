import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'todolist-theme';

/**
 * 시스템 테마 감지
 */
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * 저장된 테마 또는 시스템 테마 반환
 */
const getInitialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // SSR 또는 접근 불가 환경
  }
  return 'system';
};

/**
 * 실제 적용될 테마 결정 (system 인 경우 시스템 테마 사용)
 */
export const getEffectiveTheme = (storedTheme: Theme): 'light' | 'dark' => {
  if (storedTheme !== 'system') {
    return storedTheme;
  }
  return getSystemTheme();
};

/**
 * 테마 적용 (data-theme 속성 설정)
 */
const applyTheme = (theme: Theme) => {
  const effectiveTheme = getEffectiveTheme(theme);
  document.documentElement.setAttribute('data-theme', effectiveTheme);
};

/**
 * 초기 테마 설정 (FOUC 방지)
 */
export const initializeTheme = () => {
  const theme = getInitialTheme();
  applyTheme(theme);
  return theme;
};

// 시스템 테마 변경 감지
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'system') {
      applyTheme('system');
    }
  });
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
    set({ theme: newTheme });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    set({ theme: next });
  },
}));

// 초기 테마 적용
initializeTheme();
