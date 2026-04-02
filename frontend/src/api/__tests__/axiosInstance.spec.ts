import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// useAuthStore 모킹
const mockGetState = vi.fn();
const mockSetAuth = vi.fn();
const mockClearAuth = vi.fn();

vi.mock('@/features/auth/stores/useAuthStore', () => ({
  useAuthStore: {
    getState: mockGetState,
  },
}));

// window.location 모킹
const originalLocation = window.location;

beforeEach(() => {
  vi.resetModules();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { href: '' },
  });
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
  vi.clearAllMocks();
});

describe('axiosInstance 요청 인터셉터', () => {
  it('accessToken 이 있을 때 Authorization 헤더를 첨부한다', async () => {
    mockGetState.mockReturnValue({
      accessToken: 'test-token',
      user: null,
      setAuth: mockSetAuth,
      clearAuth: mockClearAuth,
    });

    const { axiosInstance } = await import('@/api/axiosInstance');

    const handlers = (axiosInstance.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }>;
    }).handlers;
    const requestInterceptor = handlers[0];
    expect(requestInterceptor).toBeDefined();

    const config: InternalAxiosRequestConfig = {
      headers: {} as InternalAxiosRequestConfig['headers'],
    };
    const result = requestInterceptor!.fulfilled(config);

    expect(result.headers['Authorization']).toBe('Bearer test-token');
  });

  it('accessToken 이 없을 때 Authorization 헤더를 첨부하지 않는다', async () => {
    mockGetState.mockReturnValue({
      accessToken: null,
      user: null,
      setAuth: mockSetAuth,
      clearAuth: mockClearAuth,
    });

    const { axiosInstance } = await import('@/api/axiosInstance');

    const handlers = (axiosInstance.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }>;
    }).handlers;
    const requestInterceptor = handlers[0];
    expect(requestInterceptor).toBeDefined();

    const config: InternalAxiosRequestConfig = {
      headers: {} as InternalAxiosRequestConfig['headers'],
    };
    const result = requestInterceptor!.fulfilled(config);

    expect(result.headers['Authorization']).toBeUndefined();
  });
});

describe('axiosInstance 응답 인터셉터', () => {
  beforeEach(async () => {
    mockGetState.mockReturnValue({
      accessToken: 'old-token',
      user: { id: '1', email: 'test@test.com', name: 'Test' },
      setAuth: mockSetAuth,
      clearAuth: mockClearAuth,
    });
  });

  it('401 응답 시 토큰 갱신을 시도한다', async () => {
    const { axiosInstance } = await import('@/api/axiosInstance');

    // post 메서드를 모킹
    const originalPost = axiosInstance.post;
    axiosInstance.post = vi.fn().mockResolvedValueOnce({
      data: { accessToken: 'new-token' },
    }) as unknown as typeof axiosInstance.post;

    // request 메서드를 모킹
    axiosInstance.request = vi.fn().mockResolvedValueOnce({
      data: {},
      status: 200,
    } as AxiosResponse) as unknown as typeof axiosInstance.request;

    const handlers = (axiosInstance.interceptors.response as unknown as {
      handlers: Array<{
        fulfilled: (res: AxiosResponse) => AxiosResponse;
        rejected: (err: unknown) => Promise<unknown>;
      }>;
    }).handlers;
    const responseInterceptor = handlers[0];
    expect(responseInterceptor).toBeDefined();

    const error401 = {
      isAxiosError: true,
      response: { status: 401, data: {} },
      config: { headers: {}, _retry: false, url: '/todos' },
    };

    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    try {
      await responseInterceptor!.rejected(error401);
    } catch {
      // 재시도 이후 실패해도 refresh 호출 여부만 검증
    }

    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/refresh');

    // 원복
    axiosInstance.post = originalPost;
  });

  it('refresh 실패 시 clearAuth 를 호출하고 /login 으로 리다이렉트한다', async () => {
    const { axiosInstance } = await import('@/api/axiosInstance');

    // post 메서드를 모킹 (실패)
    const originalPost = axiosInstance.post;
    axiosInstance.post = vi.fn().mockRejectedValueOnce(
      new Error('refresh failed'),
    ) as unknown as typeof axiosInstance.post;

    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    const handlers = (axiosInstance.interceptors.response as unknown as {
      handlers: Array<{
        fulfilled: (res: AxiosResponse) => AxiosResponse;
        rejected: (err: unknown) => Promise<unknown>;
      }>;
    }).handlers;
    const responseInterceptor = handlers[0];
    expect(responseInterceptor).toBeDefined();

    const error401 = {
      isAxiosError: true,
      response: { status: 401, data: {} },
      config: { headers: {}, _retry: false, url: '/todos' },
    };

    try {
      await responseInterceptor!.rejected(error401);
    } catch {
      // 예상된 reject
    }

    expect(mockClearAuth).toHaveBeenCalled();
    expect(window.location.href).toBe('/login');

    // 원복
    axiosInstance.post = originalPost;
  });
});
