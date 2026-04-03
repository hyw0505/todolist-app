import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/hooks/useTheme';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { LanguageSelector } from '@/shared/components/LanguageSelector';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

interface HeaderProps {
  /** 사용자 메뉴 표시 여부 */
  showUserMenu?: boolean;
}

/**
 * 글로벌 헤더 컴포넌트
 *
 * - Logo (todolist-app)
 * - ThemeToggle (🌙/☀️)
 * - UserMenu (로그인 사용자명 + 로그아웃)
 */
export function Header({ showUserMenu = true }: HeaderProps): React.JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { colors } = useTheme();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: colors.gnbBg,
    color: '#FFFFFF',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const leftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const logoStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    letterSpacing: '-0.5px',
  };

  const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const userMenuStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const userNameStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const logoutButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.15s ease',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  return (
    <header style={headerStyle}>
      <div style={leftSectionStyle}>
        <span style={logoStyle} onClick={() => navigate('/')}>
          todolist-app
        </span>
      </div>

      <div style={rightSectionStyle}>
        <ThemeToggle />
        <LanguageSelector />
        {showUserMenu && user && (
          <div style={userMenuStyle}>
            <span style={userNameStyle}>{user.name}</span>
            <button
              type="button"
              style={logoutButtonStyle}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {t('common.logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
