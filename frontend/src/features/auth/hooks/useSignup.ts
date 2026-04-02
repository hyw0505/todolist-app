import { useMutation } from '@tanstack/react-query';
import { signup } from '@/api/authApi';
import type { SignupRequest } from '@/types/auth';

interface UseSignupOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * 회원가입을 위한 TanStack Query useMutation 훅
 *
 * @param options - onSuccess, onError 콜백
 * @returns useMutation 결과 (mutate, isLoading, error 등)
 *
 * @example
 * ```ts
 * const { mutate: signupMutate, isLoading } = useSignup({
 *   onSuccess: () => {
 *     alert('회원가입 성공');
 *     navigate('/login');
 *   },
 * });
 *
 * signupMutate({
 *   email: 'test@example.com',
 *   password: 'Password1!',
 *   name: '홍길동',
 * });
 * ```
 */
export function useSignup(options?: UseSignupOptions) {
  return useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: (response) => {
      if (response.success) {
        options?.onSuccess?.();
      }
    },
    onError: (error) => {
      options?.onError?.(error);
    },
    meta: {
      errorMessage: '회원가입에 실패했습니다. 입력 정보를 확인해주세요.',
    },
  });
}
