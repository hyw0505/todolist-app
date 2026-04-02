import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSignup } from '../useSignup';
import * as authApi from '@/api/authApi';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('회원가입 성공 시 onSuccess 콜백이 호출된다', async () => {
    const mockSignupResponse = {
      success: true as const,
      data: {
        message: '회원가입이 완료되었습니다.',
        userId: 'user-1',
      },
    };

    vi.spyOn(authApi, 'signup').mockResolvedValue(mockSignupResponse);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useSignup({ onSuccess }), { wrapper: createWrapper() });

    result.current.mutate({
      email: 'test@example.com',
      password: 'Password1!',
      name: 'Test User',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('회원가입 실패 시 에러를 반환한다', async () => {
    const mockError = new Error('이미 존재하는 이메일입니다.');
    vi.spyOn(authApi, 'signup').mockRejectedValue(mockError);

    const onError = vi.fn();
    const { result } = renderHook(() => useSignup({ onError }), { wrapper: createWrapper() });

    result.current.mutate({
      email: 'existing@example.com',
      password: 'Password1!',
      name: 'Test User',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(mockError);
    expect(result.current.error).toBe(mockError);
  });

  it('올바른 뮤테이션 함수를 사용한다', async () => {
    const mockSignupResponse = {
      success: true as const,
      data: {
        message: '회원가입이 완료되었습니다.',
        userId: 'user-1',
      },
    };

    const signupSpy = vi.spyOn(authApi, 'signup').mockResolvedValue(mockSignupResponse);

    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper() });

    const signupData = {
      email: 'test@example.com',
      password: 'Password1!',
      name: 'Test User',
    };

    result.current.mutate(signupData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(signupSpy).toHaveBeenCalledWith(signupData);
  });
});
