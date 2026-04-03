import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore, type Language } from '@/shared/stores/useLanguageStore';
import { useTheme } from '@/shared/hooks/useTheme';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'jp', label: '日本語' },
];

/**
 * 언어 선택 드롭다운 컴포넌트
 *
 * - 🌐 아이콘 + 현재 언어 코드 표시
 * - 클릭 시 ko/en/jp 드롭다운 표시
 * - 선택 값은 localStorage(i18nextLng)에 저장
 * - WCAG 접근성 기준 준수
 */
export function LanguageSelector(): React.JSX.Element {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
  };

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

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    backgroundColor: colors.surface1,
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 100,
    minWidth: '100px',
    overflow: 'hidden',
  };

  const getOptionStyle = (isSelected: boolean): React.CSSProperties => ({
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    background: isSelected ? colors.surface2 : 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: isSelected ? 600 : 400,
    color: isSelected ? colors.primary : colors.textPrimary,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    transition: 'background-color 0.1s ease',
  });

  return (
    <div style={containerStyle}>
      <button
        type="button"
        style={buttonStyle}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t('languageSelector.label')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
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
        <span style={{ fontSize: '16px' }}>🌐</span>
        <span>{language}</span>
      </button>

      {isOpen && (
        <div style={dropdownStyle} role="listbox" aria-label={t('languageSelector.label')}>
          {LANGUAGES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="option"
              aria-selected={language === value}
              style={getOptionStyle(language === value)}
              onClick={() => handleSelect(value)}
              onMouseEnter={(e) => {
                if (language !== value) {
                  e.currentTarget.style.backgroundColor = colors.surface2;
                }
              }}
              onMouseLeave={(e) => {
                if (language !== value) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
