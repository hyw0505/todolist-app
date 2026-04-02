import React, { useState } from 'react';
import { Spinner } from './Spinner';
import { useTheme } from '@/shared/hooks/useTheme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  fontWeight: 500,
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.15s, color 0.15s, border-color 0.15s',
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
  sm: { padding: '4px 10px', fontSize: '12px', borderRadius: '4px' },
  md: { padding: '8px 16px', fontSize: '14px', borderRadius: '4px' },
  lg: { padding: '10px 20px', fontSize: '14px', borderRadius: '4px' },
};

type VariantKey = NonNullable<ButtonProps['variant']>;

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  children,
  fullWidth = false,
}: ButtonProps): React.JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const { colors, isDark } = useTheme();
  const isDisabled = disabled || loading;

  const variantStyles: Record<VariantKey, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.primary,
      color: isDark ? '#121212' : '#ffffff',
      borderRadius: '4px',
    },
    secondary: {
      backgroundColor: isDark ? colors.surface1 : '#ffffff',
      color: colors.primary,
      border: `1px solid ${colors.primary}`,
      borderRadius: '20px',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.textSecondary,
      border: `1px solid ${colors.borderStrong}`,
      borderRadius: '4px',
    },
    danger: {
      backgroundColor: colors.danger,
      color: '#ffffff',
      borderRadius: '4px',
    },
  };

  const variantHoverStyles: Record<VariantKey, React.CSSProperties> = {
    primary: { backgroundColor: colors.primaryDark },
    secondary: { backgroundColor: colors.primaryLight },
    ghost: { backgroundColor: colors.surface2 },
    danger: { backgroundColor: isDark ? '#e05050' : '#cc2d2d' },
  };

  const style: React.CSSProperties = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isHovered && !isDisabled ? variantHoverStyles[variant] : {}),
    ...(isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
    ...(fullWidth ? { width: '100%' } : {}),
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={style}
    >
      {loading && (
        <Spinner
          size="sm"
          color={variant === 'primary' || variant === 'danger' ? '#ffffff' : colors.primary}
        />
      )}
      {children}
    </button>
  );
}
