import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { AuthService } from '../services/authService';

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

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
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
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다',
        });
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
        secure: false,
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
