import React from 'react';
import { useTranslation } from 'react-i18next';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { Header } from '@/shared/components/Header';
import { useTheme } from '@/shared/hooks/useTheme';

/**
 * 회원가입 페이지 컨테이너
 */
export function SignupPage(): React.JSX.Element {
  const { t } = useTranslation();
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
    maxHeight: '90vh',
    overflowY: 'auto',
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
          <h1 style={titleStyle}>{t('page.signup')}</h1>
          <SignupForm />
        </div>
      </div>
    </>
  );
}
