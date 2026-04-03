import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Todo, TodoStatus } from '@/types/todo';
import { formatDateKorean } from '@/shared/utils/formatDate';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useTheme } from '@/shared/hooks/useTheme';

interface TodoCardProps {
  todo: Todo;
  onComplete?: (id: string, isSuccess: boolean) => void;
  onEdit?: (todo: Todo) => void | undefined;
  onDelete?: (id: string) => void;
}

/**
 * 할일 카드 컴포넌트
 *
 * - 제목, 설명, 시작일, 종료일 표시
 * - 상태 배지 표시 (색상 구분)
 * - 완료, 수정, 삭제 버튼 제공
 * - 상태별 스타일링 (좌측 보더, 배경색)
 */
export function TodoCard({ todo, onComplete, onEdit, onDelete }: TodoCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { colors } = useTheme();

  const statusLabelMap: Record<TodoStatus, string> = {
    NOT_STARTED: t('todo.status.notStarted'),
    IN_PROGRESS: t('todo.status.inProgress'),
    OVERDUE: t('todo.status.overdue'),
    COMPLETED_SUCCESS: t('todo.status.completedSuccess'),
    COMPLETED_FAILURE: t('todo.status.completedFailure'),
  };
  const statusLabel = statusLabelMap[todo.status];

  const getStatusColors = (status: TodoStatus) => {
    const map: Record<TodoStatus, { bg: string; text: string; border: string; cardBg: string }> = {
      NOT_STARTED: {
        bg: colors.statusNotStartedBg,
        text: colors.statusNotStartedText,
        border: colors.statusNotStartedBorder,
        cardBg: colors.cardBgNotStarted,
      },
      IN_PROGRESS: {
        bg: colors.statusInProgressBg,
        text: colors.statusInProgressText,
        border: colors.statusInProgressBorder,
        cardBg: colors.cardBgInProgress,
      },
      OVERDUE: {
        bg: colors.statusOverdueBg,
        text: colors.statusOverdueText,
        border: colors.statusOverdueBorder,
        cardBg: colors.cardBgOverdue,
      },
      COMPLETED_SUCCESS: {
        bg: colors.statusCompletedSuccessBg,
        text: colors.statusCompletedSuccessText,
        border: colors.statusCompletedSuccessBorder,
        cardBg: colors.cardBgCompletedSuccess,
      },
      COMPLETED_FAILURE: {
        bg: colors.statusCompletedFailureBg,
        text: colors.statusCompletedFailureText,
        border: colors.statusCompletedFailureBorder,
        cardBg: colors.cardBgCompletedFailure,
      },
    };
    return map[status];
  };

  const statusColors = getStatusColors(todo.status);

  const cardStyle: React.CSSProperties = {
    backgroundColor: statusColors.cardBg,
    borderLeft: `4px solid ${statusColors.border}`,
    borderRadius: '4px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.2s ease',
    cursor: 'pointer',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '8px',
    gap: '12px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: todo.is_completed ? colors.textMuted : colors.textPrimary,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    margin: 0,
    flex: 1,
    textDecoration: todo.is_completed ? 'line-through' : 'none',
  };

  const statusBadgeStyle: React.CSSProperties = {
    backgroundColor: statusColors.bg,
    color: statusColors.text,
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: colors.textMuted,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    marginBottom: '12px',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const dateStyle: React.CSSProperties = {
    fontSize: '12px',
    color: colors.textMuted,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    marginBottom: '12px',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  };

  const modalTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: colors.textSecondary,
    marginBottom: '16px',
  };

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCompleteModal(true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(todo);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleCompleteSuccess = () => {
    onComplete?.(todo.id, true);
    setShowCompleteModal(false);
  };

  const handleCompleteFailure = () => {
    onComplete?.(todo.id, false);
    setShowCompleteModal(false);
  };

  const handleDeleteConfirm = () => {
    onDelete?.(todo.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>{todo.title}</h3>
          <span style={statusBadgeStyle}>{statusLabel}</span>
        </div>

        {todo.description && (
          <div style={descriptionStyle}>{todo.description}</div>
        )}

        <div style={dateStyle}>
          {formatDateKorean(todo.start_date)} ~ {formatDateKorean(todo.due_date)}
        </div>

        {!todo.is_completed && (
          <div style={actionsStyle}>
            <Button variant="secondary" size="sm" onClick={handleCompleteClick}>
              {t('todo.complete')}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleEditClick}>
              {t('todo.edit')}
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteClick}>
              {t('todo.delete')}
            </Button>
          </div>
        )}

        {todo.is_completed && (
          <div style={actionsStyle}>
            <Button variant="ghost" size="sm" onClick={handleEditClick}>
              {t('todo.edit')}
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteClick}>
              {t('todo.delete')}
            </Button>
          </div>
        )}
      </div>

      {/* 완료 처리 모달 */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title={t('todo.completeModal.title')}
        size="sm"
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={modalTextStyle}>{t('todo.completeModal.message')}</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <Button variant="primary" size="md" onClick={handleCompleteSuccess}>
              {t('todo.completeModal.success')}
            </Button>
            <Button variant="ghost" size="md" onClick={handleCompleteFailure}>
              {t('todo.completeModal.failure')}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setShowCompleteModal(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 삭제 확인 다이얼로그 */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t('todo.deleteModal.title')}
        size="sm"
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={modalTextStyle}>{t('todo.deleteModal.message')}</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <Button variant="danger" size="md" onClick={handleDeleteConfirm}>
              {t('todo.delete')}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setShowDeleteConfirm(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
