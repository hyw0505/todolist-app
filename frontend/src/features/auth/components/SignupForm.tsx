import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { useSignup } from '../hooks/useSignup';
import { useTheme } from '@/shared/hooks/useTheme';
import type { SignupRequest } from '@/types/auth';

interface SignupFormProps {
  onSuccess?: () => void;
}

interface PasswordPolicy {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

/**
 * 회원가입 폼 컴포넌트
 *
 * - 이름, 이메일, 비밀번호 입력 필드
 * - 비밀번호 정책 안내 UI
 * - 실시간 유효성 검증
 * - useSignup 훅 사용
 */
export function SignupForm({ onSuccess }: SignupFormProps): React.JSX.Element {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const { mutate: signupMutate, isPending } = useSignup({
    onSuccess: () => {
      onSuccess?.();
      navigate('/login');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    },
  });

  const validatePasswordPolicy = (value: string): PasswordPolicy => ({
    minLength: value.length >= 8 && value.length <= 64,
    hasUpperCase: /[A-Z]/.test(value),
    hasLowerCase: /[a-z]/.test(value),
    hasNumber: /[0-9]/.test(value),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
  });

  const passwordPolicy = validatePasswordPolicy(password);
  const isPasswordValid = Object.values(passwordPolicy).every(Boolean);

  const validateName = (value: string): string | undefined => {
    if (!value) return '이름을 입력해주세요.';
    if (value.length < 2 || value.length > 50) return '이름은 2-50 자 사이여야 합니다.';
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value) return '이메일을 입력해주세요.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return '올바른 이메일 형식이 아닙니다.';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return '비밀번호를 입력해주세요.';
    if (value.length < 8 || value.length > 64) return '비밀번호는 8-64 자 사이여야 합니다.';
    if (!/[A-Z]/.test(value)) return '대문자를 포함해주세요.';
    if (!/[a-z]/.test(value)) return '소문자를 포함해주세요.';
    if (!/[0-9]/.test(value)) return '숫자를 포함해주세요.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return '특수문자를 포함해주세요.';
    return undefined;
  };

  const validateConfirmPassword = (value: string): string | undefined => {
    if (!value) return '비밀번호 확인을 입력해주세요.';
    if (value !== password) return '비밀번호가 일치하지 않습니다.';
    return undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);
    if (nameError || emailError || passwordError || confirmPasswordError) {
      setErrors({
        name: nameError ?? '',
        email: emailError ?? '',
        password: passwordError ?? '',
        confirmPassword: confirmPasswordError ?? '',
      });
      return;
    }
    signupMutate({ email, password, name } as SignupRequest);
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

  const passwordPolicyStyle: React.CSSProperties = {
    backgroundColor: colors.surface2,
    borderRadius: '4px',
    padding: '12px',
    marginTop: '8px',
  };

  const policyTitleStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: colors.textSecondary,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    marginBottom: '8px',
  };

  const policyListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const getPolicyItemStyle = (isValid: boolean): React.CSSProperties => ({
    fontSize: '11px',
    color: isValid ? colors.success : colors.textMuted,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  });

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
          label="이름"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          placeholder="홍길동"
          error={errors.name}
          required
          autoComplete="name"
          id="signup-name"
          name="name"
        />

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
          id="signup-email"
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
          autoComplete="new-password"
          id="signup-password"
          name="password"
        />

        {/* 비밀번호 정책 안내 */}
        <div style={passwordPolicyStyle}>
          <div style={policyTitleStyle}>비밀번호 정책</div>
          <div style={policyListStyle}>
            <div style={getPolicyItemStyle(passwordPolicy.minLength)}>
              <span>{passwordPolicy.minLength ? '✓' : '○'}</span>
              8-64 자
            </div>
            <div style={getPolicyItemStyle(passwordPolicy.hasUpperCase)}>
              <span>{passwordPolicy.hasUpperCase ? '✓' : '○'}</span>
              대문자 포함
            </div>
            <div style={getPolicyItemStyle(passwordPolicy.hasLowerCase)}>
              <span>{passwordPolicy.hasLowerCase ? '✓' : '○'}</span>
              소문자 포함
            </div>
            <div style={getPolicyItemStyle(passwordPolicy.hasNumber)}>
              <span>{passwordPolicy.hasNumber ? '✓' : '○'}</span>
              숫자 포함
            </div>
            <div style={getPolicyItemStyle(passwordPolicy.hasSpecialChar)}>
              <span>{passwordPolicy.hasSpecialChar ? '✓' : '○'}</span>
              특수문자 포함 (!@#$%^&*(),.?":{}|&lt;&gt;)
            </div>
          </div>
        </div>

        <Input
          label="비밀번호 확인"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
          }}
          placeholder="비밀번호를 다시 입력해주세요"
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
          id="signup-confirm-password"
          name="confirmPassword"
        />
      </div>

      <div style={buttonGroupStyle}>
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={isPending}
          disabled={!isPasswordValid || !confirmPassword}
        >
          회원가입
        </Button>

        <div style={linkStyle}>
          이미 계정이 있으신가요?{' '}
          <button type="button" style={linkButtonStyle} onClick={() => navigate('/login')}>
            로그인
          </button>
        </div>
      </div>
    </form>
  );
}
