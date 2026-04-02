import React, { useState } from 'react';

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

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '6px',
    color: '#1A1A1A',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const inputStyle: React.CSSProperties = {
    border: error
      ? '1px solid #FF3838'
      : isFocused
      ? '1px solid #0068C4'
      : '1px solid #C4C4C4',
    borderRadius: '4px',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#1A1A1A',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: disabled ? '#F5F5F5' : '#ffffff',
    cursor: disabled ? 'not-allowed' : 'text',
    boxShadow: error
      ? '0 0 0 3px rgba(255,56,56,0.15)'
      : isFocused
      ? '0 0 0 3px rgba(0,104,196,0.15)'
      : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#FF3838',
    marginTop: '4px',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  return (
    <div style={wrapperStyle}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
          {required && <span style={{ color: '#FF3838', marginLeft: '2px' }}>*</span>}
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
