import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/authApi';
import { useAuthStore } from '../stores/useAuthStore';
import type { LoginRequest } from '@/types/auth';

interface UseLoginOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * 로그인을 위한 TanStack Query useMutation 훅
 *
 * @param options - onSuccess, onError 콜백
 * @returns useMutation 결과 (mutate, isLoading, error 등)
 *
 * @example
 * ```ts
 * const { mutate: loginMutate, isLoading } = useLogin({
 *   onSuccess: () => {
 *     alert('로그인 성공');
 *     navigate('/');
 *   },
 * });
 *
 * loginMutate({
 *   email: 'test@example.com',
 *   password: 'Password1!',
 * });
 * ```
 */
export function useLogin(options?: UseLoginOptions) {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      if (response.success) {
        // 인증 정보를 Zustand 스토어에 저장
        setAuth(response.data.accessToken, response.data.user);
      }
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
    meta: {
      errorMessage: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
    },
  });
}
