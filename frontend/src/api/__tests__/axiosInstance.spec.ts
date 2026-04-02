import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

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
  it('accessToken이 있을 때 Authorization 헤더를 첨부한다', async () => {
    mockGetState.mockReturnValue({
      accessToken: 'test-token',
      user: null,
      setAuth: mockSetAuth,
      clearAuth: mockClearAuth,
    });

    const { axiosInstance } = await import('@/api/axiosInstance');

    // 인터셉터를 직접 실행
    const requestInterceptor = (axiosInstance.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }>;
    }).handlers[0];

    const config: InternalAxiosRequestConfig = {
      headers: axios.defaults.headers as InternalAxiosRequestConfig['headers'],
    };
    const result = requestInterceptor.fulfilled(config);

    expect(result.headers['Authorization']).toBe('Bearer test-token');
  });

  it('accessToken이 없을 때 Authorization 헤더를 첨부하지 않는다', async () => {
    // accessToken이 null인 상태로 모킹
    mockGetState.mockReturnValue({
      accessToken: null,
      user: null,
      setAuth: mockSetAuth,
      clearAuth: mockClearAuth,
    });

    const { axiosInstance } = await import('@/api/axiosInstance');

    const requestInterceptor = (axiosInstance.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }>;
    }).handlers[0];

    // Authorization 헤더가 없는 새 config 객체 사용
    const { AxiosHeaders } = axios;
    const config: InternalAxiosRequestConfig = {
      headers: new AxiosHeaders(),
    };
    const result = requestInterceptor.fulfilled(config);

    expect(result.headers['Authorization']).toBeUndefined();
  });
});

describe('axiosInstance 응답 인터셉터', () => {
  let axiosInstanceModule: { axiosInstance: AxiosInstance };

  beforeEach(async () => {
    mockGetState.mockReturnValue({
      accessToken: 'old-token',
      user: { id: '1', email: 'test@test.com', name: 'Test' },
      setAuth: mockSetAuth,
      clearAuth: mockClearAuth,
    });
    axiosInstanceModule = await import('@/api/axiosInstance');
  });

  it('401 응답 시 /auth/refresh 를 호출한다', async () => {
    const postSpy = vi.spyOn(axiosInstanceModule.axiosInstance, 'post').mockResolvedValueOnce({
      data: { accessToken: 'new-token' },
    } as AxiosResponse);

    vi.spyOn(axiosInstanceModule.axiosInstance, 'request').mockResolvedValueOnce({
      data: {},
      status: 200,
    } as AxiosResponse);

    const responseInterceptor = (axiosInstanceModule.axiosInstance.interceptors.response as unknown as {
      handlers: Array<{
        fulfilled: (res: AxiosResponse) => AxiosResponse;
        rejected: (err: unknown) => Promise<unknown>;
      }>;
    }).handlers[0];

    const error401 = {
      isAxiosError: true,
      response: { status: 401, data: {} },
      config: { headers: {}, _retry: false, url: '/todos' },
    };

    Object.defineProperty(error401, 'isAxiosError', { value: true });

    // axios.isAxiosError가 true를 반환하도록 설정
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    try {
      await responseInterceptor.rejected(error401);
    } catch {
      // 재시도 이후 실패해도 refresh 호출 여부만 검증
    }

    expect(postSpy).toHaveBeenCalledWith('/auth/refresh');
  });

  it('refresh 실패 시 clearAuth를 호출하고 /login으로 리다이렉트한다', async () => {
    vi.spyOn(axiosInstanceModule.axiosInstance, 'post').mockRejectedValueOnce(
      new Error('refresh failed'),
    );
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    const responseInterceptor = (axiosInstanceModule.axiosInstance.interceptors.response as unknown as {
      handlers: Array<{
        fulfilled: (res: AxiosResponse) => AxiosResponse;
        rejected: (err: unknown) => Promise<unknown>;
      }>;
    }).handlers[0];

    const error401 = {
      isAxiosError: true,
      response: { status: 401, data: {} },
      config: { headers: {}, _retry: false, url: '/todos' },
    };

    try {
      await responseInterceptor.rejected(error401);
    } catch {
      // 예상된 reject
    }

    expect(mockClearAuth).toHaveBeenCalled();
    expect(window.location.href).toBe('/login');
  });
});
