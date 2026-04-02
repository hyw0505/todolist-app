import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeTodo } from '@/api/todoApi';

interface UseCompleteTodoOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

/**
 * 할일 완료 처리를 위한 뮤테이션 훅
 * 
 * @param options - onSuccess, onError 콜백
 * @returns useMutation 결과 (mutate, isLoading, error 등)
 * 
 * @example
 * ```ts
 * const { mutate: completeTodoMutate, isLoading } = useCompleteTodo({
 *   onSuccess: () => {
 *     alert('할일이 완료 처리되었습니다.');
 *   },
 * });
 * 
 * completeTodoMutate({
 *   id: 'uuid',
 *   is_success: true,
 * });
 * ```
 */
export function useCompleteTodo(options?: UseCompleteTodoOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isSuccess }: { id: string; isSuccess: boolean }) =>
      completeTodo(id, { is_success: isSuccess }),
    onSuccess: (data) => {
      // 할일 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
    meta: {
      errorMessage: '할일 완료 처리에 실패했습니다.',
    },
  });
}
