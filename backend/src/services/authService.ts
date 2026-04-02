import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { env } from '../config/env';
import { AuthError, ConflictError } from '../errors/AppError';
import {
  AUTH_INVALID_CREDENTIALS,
  AUTH_USER_NOT_FOUND,
  AUTH_TOKEN_INVALID,
} from '../constants/errorCodes';
import { UserRepository } from '../repositories/userRepository';

/**
 * JWT Token payload structure for refresh tokens
 */
interface RefreshTokenPayload {
  sub: string; // userId
  type: 'refresh';
  iat: number;
  exp: number;
}

/**
 * User data returned after signup
 */
export interface SignupResult {
  userId: string;
  email: string;
  name: string;
}

/**
 * User data returned after login
 */
export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Token refresh result
 */
export interface RefreshTokenResult {
  accessToken: string;
}

/**
 * Auth service for authentication operations
 */
export class AuthService {
  private userRepository: UserRepository;

  constructor(pool: Pool) {
    this.userRepository = new UserRepository(pool);
  }

  /**
   * Register a new user
   *
   * @param email - User email
   * @param password - Plain text password
   * @param name - User name
   * @returns User registration result
   * @throws ConflictError if email already exists
   * @throws DatabaseError if registration fails
   */
  async signup(email: string, password: string, name: string): Promise<SignupResult> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('이미 사용 중인 이메일입니다');
    }

    // Hash password with bcrypt
    const saltRounds = env.BCRYPT_SALT_ROUNDS;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    try {
      const user = await this.userRepository.insertUser({
        email,
        password: hashedPassword,
        name,
      });

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      // Handle unique constraint violation
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        throw new ConflictError('이미 사용 중인 이메일입니다');
      }
      throw error;
    }
  }

  /**
   * Authenticate user and generate tokens
   *
   * @param email - User email
   * @param password - Plain text password
   * @returns Login result with access token and user info
   * @throws AuthError if credentials are invalid
   */
  async login(email: string, password: string): Promise<LoginResult & { refreshToken: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthError('이메일 또는 비밀번호가 올바르지 않습니다', AUTH_INVALID_CREDENTIALS);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthError('이메일 또는 비밀번호가 올바르지 않습니다', AUTH_INVALID_CREDENTIALS);
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   *
   * @param refreshToken - Refresh token
   * @returns New access token
   * @throws AuthError if refresh token is invalid or expired
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResult> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;

      // Validate token type
      if (decoded.type !== 'refresh') {
        throw new AuthError('유효하지 않은 토큰입니다', AUTH_TOKEN_INVALID);
      }

      // Verify user still exists
      const user = await this.userRepository.findById(decoded.sub);
      if (!user) {
        throw new AuthError('사용자를 찾을 수 없습니다', AUTH_USER_NOT_FOUND);
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user.id, user.email);

      return { accessToken };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError('세션이 만료되었습니다. 다시 로그인해 주세요', 'AUTH_TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError('유효하지 않은 토큰입니다', AUTH_TOKEN_INVALID);
      }
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('토큰 검증에 실패했습니다', AUTH_TOKEN_INVALID);
    }
  }

  /**
   * Generate JWT access token
   *
   * @param userId - User ID
   * @param email - User email
   * @returns Signed JWT token
   */
  private generateAccessToken(userId: string, email: string): string {
    return jwt.sign({ sub: userId, email }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Generate JWT refresh token
   *
   * @param userId - User ID
   * @returns Signed JWT token
   */
  private generateRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId, type: 'refresh' as const }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);
  }
}
