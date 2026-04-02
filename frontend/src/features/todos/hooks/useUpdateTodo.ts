import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTodo } from '@/api/todoApi';
import type { UpdateTodoInput } from '@/types/todo';

interface UseUpdateTodoOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

/**
 * 할일 수정을 위한 뮤테이션 훅
 * 
 * @param options - onSuccess, onError 콜백
 * @returns useMutation 결과 (mutate, isLoading, error 등)
 * 
 * @example
 * ```ts
 * const { mutate: updateTodoMutate, isLoading } = useUpdateTodo({
 *   onSuccess: () => {
 *     alert('할일이 수정되었습니다.');
 *   },
 * });
 * 
 * updateTodoMutate(
 *   { id: 'uuid' },
 *   {
 *     title: '수정된 제목',
 *     description: '수정된 설명',
 *   }
 * );
 * ```
 */
export function useUpdateTodo(options?: UseUpdateTodoOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoInput }) =>
      updateTodo(id, data),
    onSuccess: (data) => {
      // 할일 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
    meta: {
      errorMessage: '할일 수정에 실패했습니다.',
    },
  });
}
