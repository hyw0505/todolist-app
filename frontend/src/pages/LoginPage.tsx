import React from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Header } from '@/shared/components/Header';
import { useTheme } from '@/shared/hooks/useTheme';

/**
 * 로그인 페이지 컨테이너
 */
export function LoginPage(): React.JSX.Element {
  const { colors } = useTheme();

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    padding: '20px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.surface1,
    borderRadius: '8px',
    padding: '32px',
    boxShadow: colors.shadow1,
    width: '100%',
    maxWidth: '420px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.textPrimary,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    textAlign: 'center',
    margin: '0 0 24px 0',
  };

  return (
    <>
      <Header showUserMenu={false} />
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>로그인</h1>
          <LoginForm />
        </div>
      </div>
    </>
  );
}
