import React, { useState } from 'react';
import { useTheme } from '@/shared/hooks/useTheme';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'date';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string | undefined;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  id,
  name,
  autoComplete,
}: InputProps): React.JSX.Element {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useTheme();

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '6px',
    color: colors.textPrimary,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const inputStyle: React.CSSProperties = {
    border: error
      ? `1px solid ${colors.danger}`
      : isFocused
      ? `1px solid ${colors.primary}`
      : `1px solid ${colors.borderStrong}`,
    borderRadius: '4px',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    color: colors.textPrimary,
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: disabled ? colors.surface2 : colors.surface1,
    cursor: disabled ? 'not-allowed' : 'text',
    boxShadow: error
      ? colors.inputErrorShadow
      : isFocused
      ? colors.inputFocusShadow
      : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '12px',
    color: colors.danger,
    marginTop: '4px',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  return (
    <div style={wrapperStyle}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
          {required && <span style={{ color: colors.danger, marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={inputStyle}
      />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}
