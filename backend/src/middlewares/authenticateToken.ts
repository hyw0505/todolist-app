import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthError } from '../errors/AppError';
import {
  AUTH_TOKEN_MISSING,
  AUTH_TOKEN_INVALID,
  AUTH_TOKEN_EXPIRED,
} from '../constants/errorCodes';

/**
 * Extended Express Request type with user information
 */
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    iat: number;
    exp: number;
  };
}

/**
 * JWT Token payload structure
 * sub: userId (JWT standard claim)
 */
interface TokenPayload {
  sub: string; // userId
  email: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to authenticate requests using JWT tokens
 *
 * Expects Authorization header in format: "Bearer <token>"
 * On success: injects user info to req.user
 * On failure: returns 401 Unauthorized with standardized error format
 */
export function authenticateToken(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      throw new AuthError('인증 헤더가 필요합니다', AUTH_TOKEN_MISSING);
    }

    // Check if header starts with "Bearer "
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthError('인증 헤더 형식이 올바르지 않습니다', AUTH_TOKEN_MISSING);
    }

    const token = parts[1];

    // Verify the token
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

    // Inject user info into request
    (req as AuthenticatedRequest).user = {
      userId: decoded.sub,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    next();
  } catch (error) {
    // Handle JWT specific errors
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthError('토큰이 만료되었습니다', AUTH_TOKEN_EXPIRED));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthError('유효하지 않은 토큰입니다', AUTH_TOKEN_INVALID));
    } else if (error instanceof AuthError) {
      next(error);
    } else {
      // Unknown error - treat as invalid token
      next(new AuthError('토큰 검증에 실패했습니다', AUTH_TOKEN_INVALID));
    }
  }
}

/**
 * Optional authentication middleware
 *
 * Similar to authenticateToken but doesn't fail if token is missing/invalid
 * Just leaves req.user undefined if authentication fails
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

    (req as AuthenticatedRequest).user = {
      userId: decoded.sub,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    next();
  } catch {
    // Silently continue without user info
    next();
  }
}
