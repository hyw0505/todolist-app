import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    },
  });

  const validateEmail = (value: string): string | undefined => {
    if (!value) return '이메일을 입력해주세요.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return '올바른 이메일 형식이 아닙니다.';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return '비밀번호를 입력해주세요.';
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
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          placeholder="example@email.com"
          error={errors.email}
          required
          autoComplete="email"
          id="login-email"
          name="email"
        />

        <Input
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
          }}
          placeholder="비밀번호를 입력해주세요"
          error={errors.password}
          required
          autoComplete="current-password"
          id="login-password"
          name="password"
        />
      </div>

      <div style={buttonGroupStyle}>
        <Button type="submit" variant="primary" size="md" fullWidth loading={isPending}>
          로그인
        </Button>

        <div style={linkStyle}>
          계정이 없으신가요?{' '}
          <button type="button" style={linkButtonStyle} onClick={() => navigate('/signup')}>
            회원가입
          </button>
        </div>
      </div>
    </form>
  );
}
