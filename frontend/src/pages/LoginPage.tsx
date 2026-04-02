import React from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';

/**
 * 로그인 페이지 컨테이너
 */
export function LoginPage(): React.JSX.Element {
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: '20px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
    width: '100%',
    maxWidth: '420px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1A1A1A',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    textAlign: 'center',
    marginBottom: '24px',
    margin: '0 0 24px 0',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>로그인</h1>
        <LoginForm />
      </div>
    </div>
  );
}
