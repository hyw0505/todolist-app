import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { env } from '../config/env';
import { AuthError } from '../errors/AppError';
import { AuthService } from '../services/authService';
import { resetRateLimit } from '../middlewares/rateLimiter';

/**
 * Auth controller handling HTTP requests for authentication
 */
export class AuthController {
  private authService: AuthService;

  constructor(pool: Pool) {
    this.authService = new AuthService(pool);
  }

  /**
   * Handle user signup
   *
   * POST /api/v1/auth/signup
   * Body: { email, password, name }
   * Response: { success: true, message, userId } (201)
   */
  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name } = req.body;

      const result = await this.authService.signup(email, password, name);

      res.status(201).json({
        success: true,
        message: '회원가입 완료',
        userId: result.userId,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle user login
   *
   * POST /api/v1/auth/login
   * Body: { email, password }
   * Response: { success: true, accessToken, user: { id, email, name } } (200)
   * Sets refreshToken as httpOnly cookie
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      // 로그인 성공 시 rate limit 카운터 초기화
      const forwarded = req.headers['x-forwarded-for'];
      const clientIP = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (req.ip ?? req.socket.remoteAddress ?? 'unknown');
      resetRateLimit(clientIP);

      // Set refresh token as httpOnly cookie (PRD §4.7: sameSite=Strict, secure=production)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle token refresh
   *
   * POST /api/v1/auth/refresh
   * Cookie: refreshToken
   * Response: { success: true, accessToken } (200)
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get refresh token from cookie
      const refreshToken = req.cookies?.refreshToken as string | undefined;

      if (!refreshToken) {
        next(new AuthError('세션이 만료되었습니다. 다시 로그인해 주세요'));
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle user logout
   *
   * POST /api/v1/auth/logout
   * Clears refreshToken cookie
   * Response: { success: true, message } (200)
   */
  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(200).json({
        success: true,
        message: '로그아웃되었습니다',
      });
    } catch (error) {
      next(error);
    }
  };
}
