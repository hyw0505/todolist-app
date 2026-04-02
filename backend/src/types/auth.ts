/**
 * Authentication related types
 */

/**
 * Signup request body
 */
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Signup response body
 */
export interface SignupResponse {
  success: true;
  message: string;
  userId: string;
}

/**
 * Login request body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * User object in login response
 */
export interface UserInfo {
  id: string;
  email: string;
  name: string;
}

/**
 * Login response body
 */
export interface LoginResponse {
  success: true;
  accessToken: string;
  user: UserInfo;
}

/**
 * Refresh token response body
 */
export interface RefreshTokenResponse {
  success: true;
  accessToken: string;
}

/**
 * Logout response body
 */
export interface LogoutResponse {
  success: true;
  message: string;
}

/**
 * JWT payload for access token
 */
export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
  iat: number;
  exp: number;
}

/**
 * JWT payload for refresh token
 */
export interface RefreshTokenPayload {
  sub: string; // userId
  type: 'refresh';
  iat: number;
  exp: number;
}
