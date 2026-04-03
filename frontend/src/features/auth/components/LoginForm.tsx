import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { useLogin } from '../hooks/useLogin';
import { useTheme } from '@/shared/hooks/useTheme';
import type { LoginRequest } from '@/types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
}

/**
 * 로그인 폼 컴포넌트
 *
 * - 이메일, 비밀번호 입력 필드
 * - 입력값 유효성 검증 (UI 레벨)
 * - useLogin 훅 사용
 * - 성공 시 리다이렉트
 */
export function LoginForm({ onSuccess }: LoginFormProps): React.JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const { mutate: loginMutate, isPending } = useLogin({
    onSuccess: () => {
      onSuccess?.();
      navigate('/');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : t('auth.loginError');
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    },
  });

  const validateEmail = (value: string): string | undefined => {
    if (!value) return t('auth.validation.emailRequired');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return t('auth.validation.emailInvalid');
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return t('auth.validation.passwordRequired');
    return undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrors({ email: emailError ?? '', password: passwordError ?? '' });
      return;
    }
    loginMutate({ email, password } as LoginRequest);
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  };

  const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  };

  const linkStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '14px',
    color: colors.textMuted,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const linkButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: colors.primary,
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {errors.general && <ErrorMessage message={errors.general} />}

      <div style={inputGroupStyle}>
        <Input
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          placeholder={t('auth.emailPlaceholder')}
          error={errors.email}
          required
          autoComplete="email"
          id="login-email"
          name="email"
        />

        <Input
          label={t('auth.password')}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
          }}
          placeholder={t('auth.passwordPlaceholder')}
          error={errors.password}
          required
          autoComplete="current-password"
          id="login-password"
          name="password"
        />
      </div>

      <div style={buttonGroupStyle}>
        <Button type="submit" variant="primary" size="md" fullWidth loading={isPending}>
          {t('auth.loginButton')}
        </Button>

        <div style={linkStyle}>
          {t('auth.noAccount')}{' '}
          <button type="button" style={linkButtonStyle} onClick={() => navigate('/signup')}>
            {t('common.signup')}
          </button>
        </div>
      </div>
    </form>
  );
}
