import React, { useState, useEffect } from 'react';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { useUpdateTodo } from '../hooks/useUpdateTodo';
import type { Todo, UpdateTodoInput } from '@/types/todo';

interface TodoEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
  onSuccess?: () => void;
}

/**
 * 할일 수정 폼 컴포넌트
 *
 * - 기존 값으로 pre-fill
 * - 제목 (1-100 자), 설명 (0-1000 자)
 * - 시작일, 종료일 피커
 * - due_date >= start_date 검증
 * - useUpdateTodo 훅 사용
 */
export function TodoEditForm({ isOpen, onClose, todo, onSuccess }: TodoEditFormProps): React.JSX.Element | null {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    startDate?: string;
    dueDate?: string;
    general?: string;
  }>({});

  const { mutate: updateMutate, isPending } = useUpdateTodo({
    onSuccess: () => {
      onSuccess?.();
      handleClose();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '할일 수정에 실패했습니다.';
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    },
  });

  // todo 변경 시 폼 초기화
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setStartDate(todo.start_date);
      setDueDate(todo.due_date);
    }
  }, [todo]);

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setDueDate('');
    setErrors({});
    onClose();
  };

  // 제목 유효성 검증
  const validateTitle = (value: string): string | undefined => {
    if (!value) {
      return '제목을 입력해주세요.';
    }
    if (value.length < 1 || value.length > 100) {
      return '제목은 1-100 자 사이여야 합니다.';
    }
    return undefined;
  };

  // 설명 유효성 검증
  const validateDescription = (value: string): string | undefined => {
    if (value && value.length > 1000) {
      return '설명은 1000 자 이내로 입력해주세요.';
    }
    return undefined;
  };

  // 날짜 유효성 검증
  const validateDates = (start: string, due: string): { start?: string; due?: string } => {
    const errors: { start?: string; due?: string } = {};

    if (!start) {
      errors.start = '시작일을 입력해주세요.';
    }
    if (!due) {
      errors.due = '종료일을 입력해주세요.';
    }

    if (start && due) {
      const startDateObj = new Date(start);
      const dueDateObj = new Date(due);

      if (dueDateObj < startDateObj) {
        errors.due = '종료일은 시작일보다 이후여야 합니다.';
      }
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!todo) return;

    // 유효성 검사
    const titleError = validateTitle(title);
    const descriptionError = validateDescription(description);
    const dateErrors = validateDates(startDate, dueDate);

    if (titleError || descriptionError || dateErrors.start || dateErrors.due) {
      setErrors({
        title: titleError ?? '',
        description: descriptionError ?? '',
        startDate: dateErrors.start ?? '',
        dueDate: dateErrors.due ?? '',
      });
      return;
    }

    // 할일 수정 요청
    updateMutate({
      id: todo.id,
      data: {
        title,
        description: description || undefined,
        start_date: startDate,
        due_date: dueDate,
      } as UpdateTodoInput,
    });
  };

  // 폼 컨테이너 스타일
  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  };

  // 입력 필드 그룹 스타일
  const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  // 날짜 입력 그룹 스타일
  const dateGroupStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  };

  // 버튼 그룹 스타일
  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    marginTop: '8px',
  };

  // textarea 스타일
  const textareaStyle: React.CSSProperties = {
    border: errors.description ? '1px solid #FF3838' : '1px solid #C4C4C4',
    borderRadius: '4px',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#1A1A1A',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    minHeight: '100px',
    resize: 'vertical',
    backgroundColor: '#ffffff',
    boxShadow: errors.description ? '0 0 0 3px rgba(255,56,56,0.15)' : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1A1A1A',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    marginBottom: '6px',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#FF3838',
    marginTop: '4px',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  // 날짜 입력 래퍼 스타일
  const dateInputWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  const dateInputStyle: React.CSSProperties = {
    border: '1px solid #C4C4C4',
    borderRadius: '4px',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#1A1A1A',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  };

  if (!todo) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="할일 수정" size="md">
      <form onSubmit={handleSubmit} style={formStyle}>
        {errors.general && <ErrorMessage message={errors.general} />}

        <div style={inputGroupStyle}>
          <div>
            <label htmlFor="edit-todo-title" style={labelStyle}>
              제목 <span style={{ color: '#FF3838' }}>*</span>
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors((prev) => ({ ...prev, title: '' }));
                }
              }}
              placeholder="할일 제목을 입력해주세요"
              error={errors.title}
              required
              id="edit-todo-title"
              name="title"
            />
          </div>

          <div>
            <label htmlFor="edit-todo-description" style={labelStyle}>
              설명
            </label>
            <textarea
              id="edit-todo-description"
              name="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: '' }));
                }
              }}
              placeholder="설명을 입력해주세요 (선택사항)"
              style={textareaStyle}
              maxLength={1000}
            />
            {errors.description && <span style={errorStyle}>{errors.description}</span>}
            <span style={{ ...errorStyle, marginTop: '4px', color: '#767676' }}>
              {description.length}/1000 자
            </span>
          </div>

          <div style={dateGroupStyle}>
            <div style={dateInputWrapperStyle}>
              <label htmlFor="edit-todo-start-date" style={labelStyle}>
                시작일 <span style={{ color: '#FF3838' }}>*</span>
              </label>
              <input
                id="edit-todo-start-date"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (errors.startDate) {
                    setErrors((prev) => ({ ...prev, startDate: '' }));
                  }
                }}
                style={dateInputStyle}
                required
              />
              {errors.startDate && <span style={errorStyle}>{errors.startDate}</span>}
            </div>

            <div style={dateInputWrapperStyle}>
              <label htmlFor="edit-todo-due-date" style={labelStyle}>
                종료일 <span style={{ color: '#FF3838' }}>*</span>
              </label>
              <input
                id="edit-todo-due-date"
                name="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) {
                    setErrors((prev) => ({ ...prev, dueDate: '' }));
                  }
                }}
                style={{
                  ...dateInputStyle,
                  border: errors.dueDate ? '1px solid #FF3838' : '1px solid #C4C4C4',
                }}
                required
              />
              {errors.dueDate && <span style={errorStyle}>{errors.dueDate}</span>}
            </div>
          </div>
        </div>

        <div style={buttonGroupStyle}>
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" variant="primary" size="md" loading={isPending}>
            수정
          </Button>
        </div>
      </form>
    </Modal>
  );
}
