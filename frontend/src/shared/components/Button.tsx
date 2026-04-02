import React, { useState } from 'react';
import { Spinner } from './Spinner';

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

const variantStyles: Record<VariantKey, React.CSSProperties> = {
  primary: {
    backgroundColor: '#0068C4',
    color: '#ffffff',
    borderRadius: '4px',
  },
  secondary: {
    backgroundColor: '#ffffff',
    color: '#0068C4',
    border: '1px solid #0068C4',
    borderRadius: '20px',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#404040',
    border: '1px solid #C4C4C4',
    borderRadius: '4px',
  },
  danger: {
    backgroundColor: '#FF3838',
    color: '#ffffff',
    borderRadius: '4px',
  },
};

const variantHoverStyles: Record<VariantKey, React.CSSProperties> = {
  primary: { backgroundColor: '#003D7A' },
  secondary: { backgroundColor: '#E8F2FF' },
  ghost: { backgroundColor: '#F5F5F5' },
  danger: { backgroundColor: '#cc2d2d' },
};

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

  const isDisabled = disabled || loading;

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
      {loading && <Spinner size="sm" color={variant === 'primary' || variant === 'danger' ? '#ffffff' : '#0068C4'} />}
      {children}
    </button>
  );
}
