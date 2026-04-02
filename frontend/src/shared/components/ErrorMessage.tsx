import React from 'react';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps): React.JSX.Element {
  const containerStyle: React.CSSProperties = {
    backgroundColor: '#FFF0F0',
    border: '1px solid #FF3838',
    borderRadius: '4px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const textStyle: React.CSSProperties = {
    color: '#D93025',
    fontSize: '14px',
    flex: 1,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '16px',
    flexShrink: 0,
  };

  return (
    <div style={containerStyle} role="alert">
      <span style={iconStyle}>⚠</span>
      <span style={textStyle}>{message}</span>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}
