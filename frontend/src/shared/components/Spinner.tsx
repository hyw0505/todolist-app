import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const sizeMap: Record<NonNullable<SpinnerProps['size']>, number> = {
  sm: 16,
  md: 24,
  lg: 40,
};

export function Spinner({ size = 'md', color = '#0068C4' }: SpinnerProps): React.JSX.Element {
  const px = sizeMap[size];
  const borderWidth = size === 'lg' ? 4 : 3;
  const spinnerStyle: React.CSSProperties = {
    width: px,
    height: px,
    border: `${borderWidth}px solid #E8F2FF`,
    borderTop: `${borderWidth}px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
    flexShrink: 0,
  };

  return (
    <>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <span style={spinnerStyle} role="status" aria-label="로딩 중" />
    </>
  );
}
