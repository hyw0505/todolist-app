import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTodo } from '@/api/todoApi';

interface UseDeleteTodoOptions {
  onSuccess?: (data: void) => void;
  onError?: (error: unknown) => void;
}

/**
 * 할일 삭제를 위한 뮤테이션 훅
 * 
 * @param options - onSuccess, onError 콜백
 * @returns useMutation 결과 (mutate, isLoading, error 등)
 * 
 * @example
 * ```ts
 * const { mutate: deleteTodoMutate, isLoading } = useDeleteTodo({
 *   onSuccess: () => {
 *     alert('할일이 삭제되었습니다.');
 *   },
 * });
 * 
 * deleteTodoMutate({ id: 'uuid' });
 * ```
 */
export function useDeleteTodo(options?: UseDeleteTodoOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: (data) => {
      // 할일 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
    meta: {
      errorMessage: '할일 삭제에 실패했습니다.',
    },
  });
}
