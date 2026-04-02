import { axiosInstance } from './axiosInstance';
import type { SignupRequest, LoginRequest, TokenResponse } from '@/types/auth';

/**
 * 회원가입 API 응답
 */
export interface SignupApiResponse {
  success: true;
  message: string;
  userId: string;
}

/**
 * 로그인 API 응답
 */
export interface LoginApiResponse {
  success: true;
  accessToken: string;
  user: TokenResponse['user'];
}

/**
 * 토큰 갱신 API 응답
 */
export interface RefreshTokenApiResponse {
  success: true;
  accessToken: string;
}

/**
 * 에러 응답
 */
export interface ErrorApiResponse {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T> = T | ErrorApiResponse;

/**
 * 회원가입 API
 * POST /api/v1/auth/signup
 */
export async function signup(data: SignupRequest): Promise<ApiResponse<SignupApiResponse>> {
  const response = await axiosInstance.post<SignupApiResponse>('/auth/signup', data);
  return response.data;
}

/**
 * 로그인 API
 * POST /api/v1/auth/login
 */
export async function login(data: LoginRequest): Promise<ApiResponse<LoginApiResponse>> {
  const response = await axiosInstance.post<LoginApiResponse>('/auth/login', data);
  return response.data;
}

/**
 * 토큰 갱신 API
 * POST /api/v1/auth/refresh
 */
export async function refreshToken(): Promise<ApiResponse<RefreshTokenApiResponse>> {
  const response = await axiosInstance.post<RefreshTokenApiResponse>('/auth/refresh');
  return response.data;
}
