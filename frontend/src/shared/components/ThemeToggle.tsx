import React from 'react';
import { useThemeStore } from '@/shared/stores/useThemeStore';
import { useTheme } from '@/shared/hooks/useTheme';

/**
 * 테마 토글 버튼 컴포넌트
 *
 * - 현재 테마에 따라 🌙/☀️ 아이콘 + 텍스트 표시
 * - 클릭 시 라이트/다크 모드 전환
 * - LanguageSelector와 동일한 버튼 스타일
 * - WCAG 접근성 기준 준수
 */
export function ThemeToggle(): React.JSX.Element {
  const { theme, toggleTheme } = useThemeStore();
  const { colors } = useTheme();

  const isDark = theme === 'dark';

  const buttonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'background-color 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    outline: 'none',
  };

  const ariaLabel = isDark ? '라이트모드로 전환' : '다크모드로 전환';

  return (
    <button
      type="button"
      style={buttonStyle}
      onClick={toggleTheme}
      aria-label={ariaLabel}
      aria-pressed={isDark}
      title={ariaLabel}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `2px solid ${colors.primary}`;
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
    >
      <span style={{ fontSize: '16px', lineHeight: '1' }}>
        {isDark ? '🌙' : '☀️'}
      </span>
      <span>{isDark ? 'dark' : 'light'}</span>
    </button>
  );
}
