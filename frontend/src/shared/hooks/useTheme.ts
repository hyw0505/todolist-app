import { useThemeStore } from '@/shared/stores/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS } from '@/shared/constants/themeTokens';
import { getEffectiveTheme } from '@/shared/stores/useThemeStore';
import type { ThemeColors } from '@/shared/constants/themeTokens';
import type { Theme } from '@/shared/stores/useThemeStore';

interface UseThemeResult {
  theme: Theme;
  toggle: () => void;
  colors: ThemeColors;
  isDark: boolean;
  effectiveTheme: 'light' | 'dark';
}

export function useTheme(): UseThemeResult {
  const { theme, toggleTheme } = useThemeStore();
  const effectiveTheme = getEffectiveTheme(theme);
  const colors = effectiveTheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  return { 
    theme, 
    toggle: toggleTheme,
    colors, 
    isDark: effectiveTheme === 'dark',
    effectiveTheme,
  };
}
