import React, { useState } from 'react';
import type { Todo, TodoStatus } from '@/types/todo';
import {
  getTodoStatusLabel,
  getTodoStatusBgColor,
  getTodoStatusTextColor,
  getTodoStatusBorderColor,
} from '@/shared/utils/todoStatusLabel';
import { formatDateKorean } from '@/shared/utils/formatDate';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';

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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusLabel = getTodoStatusLabel(todo.status);
  const statusBgColor = getTodoStatusBgColor(todo.status);
  const statusTextColor = getTodoStatusTextColor(todo.status);
  const statusBorderColor = getTodoStatusBorderColor(todo.status);

  // 상태별 카드 배경색 (스타일 가이드 준수)
  const getCardBackgroundColor = (status: TodoStatus): string => {
    const colors: Record<TodoStatus, string> = {
      NOT_STARTED: '#ffffff',
      IN_PROGRESS: '#ffffff',
      OVERDUE: '#FFF0F0',
      COMPLETED_SUCCESS: '#F0FFF4',
      COMPLETED_FAILURE: '#FFF5F5',
    };
    return colors[status];
  };

  // 카드 컨테이너 스타일
  const cardStyle: React.CSSProperties = {
    backgroundColor: getCardBackgroundColor(todo.status),
    borderLeft: `4px solid ${statusBorderColor}`,
    borderRadius: '4px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.2s ease',
    cursor: 'pointer',
  };

  // 헤더 영역 (상태 배지 + 제목)
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '8px',
    gap: '12px',
  };

  // 제목 스타일
  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: todo.is_completed ? '#767676' : '#1A1A1A',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    margin: 0,
    flex: 1,
    textDecoration: todo.is_completed ? 'line-through' : 'none',
  };

  // 상태 배지 스타일
  const statusBadgeStyle: React.CSSProperties = {
    backgroundColor: statusBgColor,
    color: statusTextColor,
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };

  // 설명 스타일
  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#767676',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    marginBottom: '12px',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  // 날짜 정보 스타일
  const dateStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#767676',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    marginBottom: '12px',
  };

  // 액션 버튼 영역 스타일
  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
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
              완료
            </Button>
            <Button variant="ghost" size="sm" onClick={handleEditClick}>
              수정
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteClick}>
              삭제
            </Button>
          </div>
        )}

        {todo.is_completed && (
          <div style={actionsStyle}>
            <Button variant="ghost" size="sm" onClick={handleEditClick}>
              수정
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteClick}>
              삭제
            </Button>
          </div>
        )}
      </div>

      {/* 완료 처리 모달 */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="할일 완료 처리"
        size="sm"
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: '14px', color: '#404040', marginBottom: '16px' }}>
            할일을 완료 처리하시겠습니까?
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <Button variant="primary" size="md" onClick={handleCompleteSuccess}>
              성공
            </Button>
            <Button variant="ghost" size="md" onClick={handleCompleteFailure}>
              실패
            </Button>
            <Button variant="ghost" size="md" onClick={() => setShowCompleteModal(false)}>
              취소
            </Button>
          </div>
        </div>
      </Modal>

      {/* 삭제 확인 다이얼로그 */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="할일 삭제"
        size="sm"
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: '14px', color: '#404040', marginBottom: '16px' }}>
            정말로 이 할일을 삭제하시겠습니까?
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <Button variant="danger" size="md" onClick={handleDeleteConfirm}>
              삭제
            </Button>
            <Button variant="ghost" size="md" onClick={() => setShowDeleteConfirm(false)}>
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
