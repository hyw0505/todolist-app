import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTodoFilterStore } from '../stores/useTodoFilterStore';
import { useTheme } from '@/shared/hooks/useTheme';
import type { TodoStatus } from '@/types/todo';

/**
 * 할일 필터 바 컴포넌트
 *
 * - 상태 필터: 전체, NOT_STARTED, IN_PROGRESS, OVERDUE, COMPLETED_SUCCESS, COMPLETED_FAILURE
 * - 정렬 기준: 시작일, 종료일
 * - 정렬 순서: 오름차순, 내림차순
 * - useTodoFilterStore 와 연동되어 변경 시 자동 재조회
 */
export function TodoFilterBar(): React.JSX.Element {
  const { t } = useTranslation();
  const { status, setStatus, sortBy, setSortBy, sortOrder, setSortOrder } = useTodoFilterStore();
  const { colors } = useTheme();

  const STATUS_OPTIONS: { value: TodoStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: t('filter.all') },
    { value: 'NOT_STARTED', label: t('filter.notStarted') },
    { value: 'IN_PROGRESS', label: t('filter.inProgress') },
    { value: 'OVERDUE', label: t('filter.overdue') },
    { value: 'COMPLETED_SUCCESS', label: t('filter.completedSuccess') },
    { value: 'COMPLETED_FAILURE', label: t('filter.completedFailure') },
  ];

  const SORT_BY_OPTIONS: { value: 'start_date' | 'due_date'; label: string }[] = [
    { value: 'start_date', label: t('filter.startDate') },
    { value: 'due_date', label: t('filter.dueDate') },
  ];

  const SORT_ORDER_OPTIONS: { value: 'asc' | 'desc'; label: string }[] = [
    { value: 'asc', label: t('filter.asc') },
    { value: 'desc', label: t('filter.desc') },
  ];

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.surface2,
    height: '48px',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderRadius: '4px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  };

  const filterGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: colors.textSecondary,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const getSelectStyle = (isActive: boolean): React.CSSProperties => ({
    appearance: 'none',
    backgroundColor: isActive ? colors.surface1 : colors.surface2,
    border: isActive ? `2px solid ${colors.primary}` : `1px solid ${colors.borderStrong}`,
    borderRadius: '4px',
    padding: '6px 28px 6px 10px',
    fontSize: '13px',
    fontWeight: 500,
    color: isActive ? colors.primary : colors.textSecondary,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    cursor: 'pointer',
    outline: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23767676' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 6px center',
    backgroundSize: '16px',
    transition: 'border-color 0.15s, background-color 0.15s',
  });

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '20px',
    backgroundColor: colors.borderStrong,
  };

  return (
    <div style={containerStyle}>
      {/* 상태 필터 */}
      <div style={filterGroupStyle}>
        <span style={labelStyle}>{t('filter.status')}</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TodoStatus | 'ALL')}
          style={getSelectStyle(status !== 'ALL')}
          aria-label={t('filter.status')}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={dividerStyle} />

      {/* 정렬 기준 */}
      <div style={filterGroupStyle}>
        <span style={labelStyle}>{t('filter.sort')}</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'start_date' | 'due_date')}
          style={getSelectStyle(true)}
          aria-label={t('filter.sort')}
        >
          {SORT_BY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 정렬 순서 */}
      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
        style={getSelectStyle(true)}
        aria-label={t('filter.sort')}
      >
        {SORT_ORDER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
