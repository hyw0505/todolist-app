import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

interface RefreshResponse {
  accessToken: string;
}

interface QueueItem {
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((item) => {
    if (error !== null) {
      item.reject(error);
    } else if (token !== null) {
      item.resolve(token);
    }
  });
  failedQueue = [];
}

export const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  withCredentials: true,
});

// 요청 인터셉터: accessToken이 있으면 Authorization 헤더 첨부
axiosInstance.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken !== null) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

// 응답 인터셉터: 401 감지 시 토큰 갱신 후 재시도
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(toApiError(error));
    }

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry === true) {
      return Promise.reject(toApiError(error));
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          if (originalRequest.headers === undefined) {
            originalRequest.headers = {};
          }
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        })
        .catch((err: unknown) => Promise.reject(toApiError(err)));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axiosInstance.post<RefreshResponse>('/auth/refresh');
      const newToken = response.data.accessToken;
      const { user } = useAuthStore.getState();
      if (user !== null) {
        useAuthStore.getState().setAuth(newToken, user);
      }
      processQueue(null, newToken);
      if (originalRequest.headers === undefined) {
        originalRequest.headers = {};
      }
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError: unknown) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(toApiError(refreshError));
    } finally {
      isRefreshing = false;
    }
  },
);

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error) && error.response?.data !== undefined) {
    const data = error.response.data as Partial<ApiError>;
    const result: ApiError = {
      success: false,
      message: data.message ?? '알 수 없는 오류가 발생했습니다.',
    };
    if (data.code !== undefined) {
      result.code = data.code;
    }
    if (data.details !== undefined) {
      result.details = data.details;
    }
    return result;
  }
  if (error instanceof Error) {
    return { success: false, message: error.message };
  }
  return { success: false, message: '알 수 없는 오류가 발생했습니다.' };
}
