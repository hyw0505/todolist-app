import React from 'react';
import { SignupForm } from '@/features/auth/components/SignupForm';

/**
 * 회원가입 페이지 컨테이너
 */
export function SignupPage(): React.JSX.Element {
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
    maxHeight: '90vh',
    overflowY: 'auto',
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
        <h1 style={titleStyle}>회원가입</h1>
        <SignupForm />
      </div>
    </div>
  );
}
