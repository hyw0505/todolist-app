import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { useSignup } from '../hooks/useSignup';
import { useTheme } from '@/shared/hooks/useTheme';
import { useLanguageStore, type Language } from '@/shared/stores/useLanguageStore';
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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { language, setLanguage } = useLanguageStore();
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
      const errorMessage = error instanceof Error ? error.message : t('auth.signupError');
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
    if (!value) return t('auth.validation.nameRequired');
    if (value.length < 2 || value.length > 50) return t('auth.validation.nameLength');
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value) return t('auth.validation.emailRequired');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return t('auth.validation.emailInvalid');
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return t('auth.validation.passwordRequired');
    if (value.length < 8 || value.length > 64) return t('auth.validation.passwordLength');
    if (!/[A-Z]/.test(value)) return t('auth.validation.passwordUppercase');
    if (!/[a-z]/.test(value)) return t('auth.validation.passwordLowercase');
    if (!/[0-9]/.test(value)) return t('auth.validation.passwordNumber');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return t('auth.validation.passwordSpecial');
    return undefined;
  };

  const validateConfirmPassword = (value: string): string | undefined => {
    if (!value) return t('auth.validation.confirmPasswordRequired');
    if (value !== password) return t('auth.validation.confirmPasswordMismatch');
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

  const languageSelectorGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  };

  const languageLabelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: colors.textSecondary,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const languageButtonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
  };

  const getLanguageButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px',
    border: `1px solid ${isSelected ? colors.primary : colors.border}`,
    borderRadius: '4px',
    backgroundColor: isSelected ? colors.primary : 'transparent',
    color: isSelected ? '#FFFFFF' : colors.textPrimary,
    fontSize: '13px',
    fontWeight: isSelected ? 600 : 400,
    cursor: 'pointer',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    transition: 'all 0.15s ease',
  });

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {errors.general && <ErrorMessage message={errors.general} />}

      <div style={inputGroupStyle}>
        <Input
          label={t('auth.name')}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          placeholder={t('auth.namePlaceholder')}
          error={errors.name}
          required
          autoComplete="name"
          id="signup-name"
          name="name"
        />

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
          id="signup-email"
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
          autoComplete="new-password"
          id="signup-password"
          name="password"
        />

        {/* 비밀번호 정책 안내 */}
        <div style={passwordPolicyStyle}>
          <div style={policyTitleStyle}>{t('auth.passwordPolicy.title')}</div>
          <div style={policyListStyle}>
            <div style={getPolicyItemStyle(passwordPolicy.minLength)}>
              <span>{passwordPolicy.minLength ? '✓' : '○'}</span>
              {t('auth.passwordPolicy.minLength')}
            </div>
            <div style={getPolicyItemStyle(passwordPolicy.hasUpperCase)}>
              <span>{passwordPolicy.hasUpperCase ? '✓' : '○'}</span>
              {t('auth.passwordPolicy.uppercase')}
            </div>
            <div style={getPolicyItemStyle(passwordPolicy.hasLowerCase)}>
              <span>{passwordPolicy.hasLowerCase ? '✓' : '○'}</span>
              {t('auth.passwordPolicy.lowercase')}
            </div>
            <div style={getPolicyItemStyle(passwordPolicy.hasNumber)}>
              <span>{passwordPolicy.hasNumber ? '✓' : '○'}</span>
              {t('auth.passwordPolicy.number')}
            </div>
            <div style={getPolicyItemStyle(passwordPolicy.hasSpecialChar)}>
              <span>{passwordPolicy.hasSpecialChar ? '✓' : '○'}</span>
              {t('auth.passwordPolicy.special')}
            </div>
          </div>
        </div>

        <Input
          label={t('auth.confirmPassword')}
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
          }}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
          id="signup-confirm-password"
          name="confirmPassword"
        />

        {/* 언어 선택 (localStorage에만 저장) */}
        <div style={languageSelectorGroupStyle}>
          <span style={languageLabelStyle}>{t('auth.language')}</span>
          <div style={languageButtonGroupStyle} role="group" aria-label={t('auth.language')}>
            {(['ko', 'en', 'jp'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                style={getLanguageButtonStyle(language === lang)}
                onClick={() => setLanguage(lang)}
                aria-pressed={language === lang}
              >
                {lang === 'ko' ? '한국어' : lang === 'en' ? 'English' : '日本語'}
              </button>
            ))}
          </div>
        </div>
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
          {t('auth.signupButton')}
        </Button>

        <div style={linkStyle}>
          {t('auth.hasAccount')}{' '}
          <button type="button" style={linkButtonStyle} onClick={() => navigate('/login')}>
            {t('common.login')}
          </button>
        </div>
      </div>
    </form>
  );
}
