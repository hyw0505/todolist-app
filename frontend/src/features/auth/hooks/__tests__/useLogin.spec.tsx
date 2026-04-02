import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin } from '../useLogin';
import * as authApi from '@/api/authApi';
import { useAuthStore } from '../../stores/useAuthStore';

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

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it('로그인 성공 시 인증 정보를 스토어에 저장한다', async () => {
    const mockLoginResponse = {
      success: true as const,
      accessToken: 'test-access-token',
      user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
    };

    vi.spyOn(authApi, 'login').mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ email: 'test@example.com', password: 'Password1!' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const { accessToken, user } = useAuthStore.getState();
    expect(accessToken).toBe('test-access-token');
    expect(user).toEqual({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
  });

  it('로그인 실패 시 에러를 반환한다', async () => {
    const mockError = new Error('로그인에 실패했습니다.');
    vi.spyOn(authApi, 'login').mockRejectedValue(mockError);

    const onError = vi.fn();
    const { result } = renderHook(() => useLogin({ onError }), { wrapper: createWrapper() });

    result.current.mutate({ email: 'test@example.com', password: 'wrong' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(mockError);
    expect(result.current.error).toBe(mockError);
  });

  it('onSuccess 콜백이 호출된다', async () => {
    const mockLoginResponse = {
      success: true as const,
      accessToken: 'test-token',
      user: { id: 'user-1', email: 'test@example.com', name: 'Test' },
    };

    vi.spyOn(authApi, 'login').mockResolvedValue(mockLoginResponse);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useLogin({ onSuccess }), { wrapper: createWrapper() });

    result.current.mutate({ email: 'test@example.com', password: 'Password1!' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
