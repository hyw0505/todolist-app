import React from 'react';
import { useTodoFilterStore } from '../stores/useTodoFilterStore';
import type { TodoStatus } from '@/types/todo';

/** 상태 필터 옵션 */
const STATUS_OPTIONS: { value: TodoStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'NOT_STARTED', label: '시작 전' },
  { value: 'IN_PROGRESS', label: '진행 중' },
  { value: 'OVERDUE', label: '기한 초과' },
  { value: 'COMPLETED_SUCCESS', label: '완료 (성공)' },
  { value: 'COMPLETED_FAILURE', label: '완료 (실패)' },
];

/** 정렬 기준 옵션 */
const SORT_BY_OPTIONS: { value: 'start_date' | 'due_date'; label: string }[] = [
  { value: 'start_date', label: '시작일' },
  { value: 'due_date', label: '종료일' },
];

/** 정렬 순서 옵션 */
const SORT_ORDER_OPTIONS: { value: 'asc' | 'desc'; label: string }[] = [
  { value: 'asc', label: '오름차순' },
  { value: 'desc', label: '내림차순' },
];

/**
 * 할일 필터 바 컴포넌트
 * 
 * - 상태 필터: 전체, NOT_STARTED, IN_PROGRESS, OVERDUE, COMPLETED_SUCCESS, COMPLETED_FAILURE
 * - 정렬 기준: 시작일, 종료일
 * - 정렬 순서: 오름차순, 내림차순
 * - useTodoFilterStore 와 연동되어 변경 시 자동 재조회
 */
export function TodoFilterBar(): React.JSX.Element {
  const {
    status,
    setStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  } = useTodoFilterStore();

  // 필터 바 컨테이너 스타일
  const containerStyle: React.CSSProperties = {
    backgroundColor: '#F5F5F5',
    height: '48px',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderRadius: '4px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  };

  // 필터 그룹 스타일
  const filterGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  // 레이블 스타일
  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: '#404040',
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  // 셀렉트 컨테이너 스타일
  const selectContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  };

  // 셀렉트 스타일
  const getSelectStyle = (isActive: boolean): React.CSSProperties => ({
    appearance: 'none',
    backgroundColor: isActive ? '#ffffff' : '#F5F5F5',
    border: isActive ? '2px solid #0068C4' : '1px solid #C4C4C4',
    borderBottom: isActive ? '2px solid #0068C4' : '1px solid #C4C4C4',
    borderRadius: '4px',
    padding: '6px 28px 6px 10px',
    fontSize: '13px',
    fontWeight: 500,
    color: isActive ? '#0068C4' : '#404040',
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
    backgroundColor: '#C4C4C4',
  };

  return (
    <div style={containerStyle}>
      {/* 상태 필터 */}
      <div style={filterGroupStyle}>
        <span style={labelStyle}>상태</span>
        <div style={selectContainerStyle}>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TodoStatus | 'ALL')}
            style={getSelectStyle(status !== 'ALL')}
            aria-label="상태 필터"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={dividerStyle} />

      {/* 정렬 기준 */}
      <div style={filterGroupStyle}>
        <span style={labelStyle}>정렬</span>
        <div style={selectContainerStyle}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'start_date' | 'due_date')}
            style={getSelectStyle(true)}
            aria-label="정렬 기준"
          >
            {SORT_BY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 정렬 순서 */}
      <div style={selectContainerStyle}>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          style={getSelectStyle(true)}
          aria-label="정렬 순서"
        >
          {SORT_ORDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
