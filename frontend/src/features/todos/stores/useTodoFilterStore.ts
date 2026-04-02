import { create } from 'zustand';
import type { TodoStatus } from '@/types/todo';

interface TodoFilterState {
  // Filters
  status: TodoStatus | 'ALL';
  sortBy: 'start_date' | 'due_date';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;

  // Actions
  setStatus: (status: TodoStatus | 'ALL') => void;
  setSortBy: (sortBy: 'start_date' | 'due_date') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

const INITIAL_STATE: Omit<TodoFilterState, keyof Pick<TodoFilterState, 'setStatus' | 'setSortBy' | 'setSortOrder' | 'setPage' | 'setLimit' | 'reset'>> = {
  status: 'ALL',
  sortBy: 'due_date',
  sortOrder: 'asc',
  page: 1,
  limit: 10,
};

/**
 * 할일 필터 상태 관리 Zustand 스토어
 * 
 * @example
 * ```ts
 * const { status, setStatus, reset } = useTodoFilterStore();
 * 
 * // 필터 변경 시 자동으로 목록 재조회
 * setStatus('IN_PROGRESS');
 * 
 * // 초기화
 * reset();
 * ```
 */
export const useTodoFilterStore = create<TodoFilterState>()((set) => ({
  ...INITIAL_STATE,

  setStatus: (status) => set({ status, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy, page: 1 }),
  setSortOrder: (sortOrder) => set({ sortOrder, page: 1 }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),
  reset: () => set(INITIAL_STATE),
}));
