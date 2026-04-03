import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      const errorMessage = error instanceof Error ? error.message : t('todo.editModal.editError');
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    },
  });

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

  const validateTitle = (value: string): string | undefined => {
    if (!value) return t('todo.validation.titleRequired');
    if (value.length < 1 || value.length > 100) return t('todo.validation.titleLength');
    return undefined;
  };

  const validateDescription = (value: string): string | undefined => {
    if (value && value.length > 1000) return t('todo.validation.descriptionLength');
    return undefined;
  };

  const validateDates = (start: string, due: string): { start?: string; due?: string } => {
    const errs: { start?: string; due?: string } = {};
    if (!start) errs.start = t('todo.validation.startDateRequired');
    if (!due) errs.due = t('todo.validation.dueDateRequired');
    if (start && due && new Date(due) < new Date(start)) {
      errs.due = t('todo.validation.dueDateAfterStartDate');
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todo) return;

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

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  };

  const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const dateGroupStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    marginTop: '8px',
  };

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
    <Modal isOpen={isOpen} onClose={handleClose} title={t('todo.editModal.title')} size="md">
      <form onSubmit={handleSubmit} style={formStyle}>
        {errors.general && <ErrorMessage message={errors.general} />}

        <div style={inputGroupStyle}>
          <div>
            <label htmlFor="edit-todo-title" style={labelStyle}>
              {t('todo.createModal.titleLabel')} <span style={{ color: '#FF3838' }}>*</span>
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder={t('todo.editModal.titlePlaceholder')}
              error={errors.title}
              required
              id="edit-todo-title"
              name="title"
            />
          </div>

          <div>
            <label htmlFor="edit-todo-description" style={labelStyle}>
              {t('todo.createModal.descriptionLabel')}
            </label>
            <textarea
              id="edit-todo-description"
              name="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              placeholder={t('todo.editModal.descriptionPlaceholder')}
              style={textareaStyle}
              maxLength={1000}
            />
            {errors.description && <span style={errorStyle}>{errors.description}</span>}
            <span style={{ ...errorStyle, marginTop: '4px', color: '#767676' }}>
              {description.length}/1000
            </span>
          </div>

          <div style={dateGroupStyle}>
            <div style={dateInputWrapperStyle}>
              <label htmlFor="edit-todo-start-date" style={labelStyle}>
                {t('todo.createModal.startDate')} <span style={{ color: '#FF3838' }}>*</span>
              </label>
              <input
                id="edit-todo-start-date"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: '' }));
                }}
                style={dateInputStyle}
                required
              />
              {errors.startDate && <span style={errorStyle}>{errors.startDate}</span>}
            </div>

            <div style={dateInputWrapperStyle}>
              <label htmlFor="edit-todo-due-date" style={labelStyle}>
                {t('todo.createModal.dueDate')} <span style={{ color: '#FF3838' }}>*</span>
              </label>
              <input
                id="edit-todo-due-date"
                name="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
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
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" size="md" loading={isPending}>
            {t('todo.editModal.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
