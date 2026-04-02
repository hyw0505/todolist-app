import { useQuery } from '@tanstack/react-query';
import { getTodos } from '@/api/todoApi';
import type { TodosQueryParams } from '@/types/todo';

interface UseTodosOptions extends TodosQueryParams {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

/**
 * 할일 목록 조회를 위한 TanStack Query 훅
 * 
 * @param options - 쿼리 파라미터 및 옵션
 * @returns useQuery 결과 (data, isLoading, error, refetch 등)
 * 
 * @example
 * ```ts
 * const { data, isLoading, error } = useTodos({
 *   status: 'IN_PROGRESS',
 *   sortBy: 'due_date',
 *   sortOrder: 'asc',
 *   page: 1,
 *   limit: 10,
 * });
 * ```
 */
export function useTodos(options: UseTodosOptions = {}) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 분
    cacheTime = 10 * 60 * 1000, // 10 분
    ...params
  } = options;

  return useQuery({
    queryKey: ['todos', params],
    queryFn: () => getTodos(params),
    enabled,
    staleTime,
    gcTime: cacheTime, // gcTime is the new name for cacheTime in TanStack Query v5
    meta: {
      errorMessage: '할일 목록을 불러오는데 실패했습니다.',
    },
  });
}
