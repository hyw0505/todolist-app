import React from 'react';
import { useThemeStore } from '@/shared/stores/useThemeStore';
import { useTheme } from '@/shared/hooks/useTheme';

/**
 * 테마 토글 버튼 컴포넌트
 *
 * - 현재 테마에 따라 🌙/☀️ 아이콘 표시
 * - 클릭 시 라이트/다크 모드 전환
 * - 원형 버튼 (border-radius: 50%)
 * - hover 시 배경색 표시
 * - WCAG 접근성 기준 준수
 */
export function ThemeToggle(): React.JSX.Element {
  const { theme, toggleTheme } = useThemeStore();
  const { colors } = useTheme();

  // 실제 적용 중인 테마 (system 제외)
  const isDark = theme === 'dark';

  const handleClick = () => {
    toggleTheme();
  };

  const buttonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    borderRadius: '50%',
    padding: '12px',
    cursor: 'pointer',
    color: colors.textPrimary,
    transition: 'background-color 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
  };

  // 접근성: 테마 전환 버튼
  const ariaLabel = isDark ? '라이트모드로 전환' : '다크모드로 전환';

  return (
    <button
      type="button"
      style={buttonStyle}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-pressed={isDark}
      title={ariaLabel}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.surface2;
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
      <span
        style={{
          fontSize: '20px',
          lineHeight: '1',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
