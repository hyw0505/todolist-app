import { axiosInstance } from './axiosInstance';
import type { SignupRequest, LoginRequest, TokenResponse, SignupResponse } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

/**
 * 회원가입 API
 * POST /api/v1/auth/signup
 */
export async function signup(data: SignupRequest): Promise<ApiResponse<SignupResponse>> {
  const response = await axiosInstance.post<ApiResponse<SignupResponse>>('/auth/signup', data);
  return response.data;
}

/**
 * 로그인 API
 * POST /api/v1/auth/login
 */
export async function login(data: LoginRequest): Promise<ApiResponse<TokenResponse>> {
  const response = await axiosInstance.post<ApiResponse<TokenResponse>>('/auth/login', data);
  return response.data;
}

/**
 * 토큰 갱신 API
 * POST /api/v1/auth/refresh
 */
export async function refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
  const response = await axiosInstance.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
  return response.data;
}
