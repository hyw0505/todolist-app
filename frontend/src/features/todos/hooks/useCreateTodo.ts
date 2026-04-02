import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodo } from '@/api/todoApi';
import type { CreateTodoInput } from '@/types/todo';

interface UseCreateTodoOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

/**
 * 할일 생성을 위한 뮤테이션 훅
 * 
 * @param options - onSuccess, onError 콜백
 * @returns useMutation 결과 (mutate, isLoading, error 등)
 * 
 * @example
 * ```ts
 * const { mutate: createTodoMutate, isLoading } = useCreateTodo({
 *   onSuccess: () => {
 *     alert('할일이 생성되었습니다.');
 *   },
 * });
 * 
 * createTodoMutate({
 *   title: '새 할일',
 *   description: '설명',
 *   start_date: '2024-01-01',
 *   due_date: '2024-01-10',
 * });
 * ```
 */
export function useCreateTodo(options?: UseCreateTodoOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTodoInput) => createTodo(data),
    onSuccess: (data) => {
      // 할일 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
    meta: {
      errorMessage: '할일 생성에 실패했습니다.',
    },
  });
}
