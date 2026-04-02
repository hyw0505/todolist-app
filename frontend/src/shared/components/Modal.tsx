import React, { useEffect } from 'react';
import { useTheme } from '@/shared/hooks/useTheme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const maxWidthMap: Record<NonNullable<ModalProps['size']>, number> = {
  sm: 400,
  md: 520,
  lg: 720,
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps): React.JSX.Element | null {
  const { colors } = useTheme();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: colors.overlayBg,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.surface1,
    borderRadius: '8px',
    padding: '24px',
    boxShadow: colors.shadow2,
    maxWidth: maxWidthMap[size],
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: title ? '16px' : 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: colors.textPrimary,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    margin: 0,
  };

  const closeBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    color: colors.textMuted,
    lineHeight: 1,
    padding: '0 4px',
    display: 'flex',
    alignItems: 'center',
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={backdropStyle} onClick={handleBackdropClick}>
      <div style={containerStyle}>
        {title !== undefined && (
          <div style={headerStyle}>
            <h2 style={titleStyle}>{title}</h2>
            <button style={closeBtnStyle} onClick={onClose} aria-label="닫기" type="button">
              ×
            </button>
          </div>
        )}
        {title === undefined && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button style={closeBtnStyle} onClick={onClose} aria-label="닫기" type="button">
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
