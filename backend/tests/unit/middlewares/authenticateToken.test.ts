import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  authenticateToken,
  optionalAuth,
  AuthenticatedRequest,
} from '../../../src/middlewares/authenticateToken';
import { env } from '../../../src/config/env';
import { AuthError } from '../../../src/errors/AppError';
import {
  AUTH_TOKEN_MISSING,
  AUTH_TOKEN_INVALID,
  AUTH_TOKEN_EXPIRED,
} from '../../../src/constants/errorCodes';

// Mock jwt module
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  JsonWebTokenError: class JsonWebTokenError extends Error {},
  TokenExpiredError: class TokenExpiredError extends Error {},
}));

// Mock env
jest.mock('../../../src/config/env', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test-access-secret-must-be-32-chars-min!!',
  },
}));

describe('authenticateToken middleware (BE-05)', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  const mockUser = {
    userId: 123,
    email: 'test@example.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(() => {
    mockReq = {
      headers: {},
      socket: { remoteAddress: '127.0.0.1' } as any,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('Valid token', () => {
    test('should call next() and set req.user with valid token', () => {
      const validToken = 'valid-token-123';
      mockReq.headers = {
        authorization: `Bearer ${validToken}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(validToken, env.JWT_ACCESS_SECRET);
      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as AuthenticatedRequest).user).toEqual({
        userId: mockUser.userId,
        email: mockUser.email,
        iat: mockUser.iat,
        exp: mockUser.exp,
      });
    });
  });

  describe('Missing Authorization header', () => {
    test('should return 401 when Authorization header is missing', () => {
      mockReq.headers = {};

      authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = mockNext.mock.calls[0][0] as AuthError;
      expect(error.code).toBe(AUTH_TOKEN_MISSING);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authorization header is missing');
    });
  });

  describe('Invalid token format', () => {
    test('should return 401 when header does not start with "Bearer"', () => {
      mockReq.headers = {
        authorization: 'Basic some-token',
      };

      authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = mockNext.mock.calls[0][0] as AuthError;
      expect(error.code).toBe(AUTH_TOKEN_MISSING);
      expect(error.statusCode).toBe(401);
    });

    test('should return 401 when header has incorrect format (missing space)', () => {
      mockReq.headers = {
        authorization: 'Bearer',
      };

      authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = mockNext.mock.calls[0][0] as AuthError;
      expect(error.code).toBe(AUTH_TOKEN_MISSING);
    });

    test('should return 401 when header has multiple spaces', () => {
      mockReq.headers = {
        authorization: 'Bearer token extra',
      };

      authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = mockNext.mock.calls[0][0] as AuthError;
      expect(error.code).toBe(AUTH_TOKEN_MISSING);
    });
  });

  describe('Expired token', () => {
    test('should return 401 when token has expired', () => {
      const expiredToken = 'expired-token';
      mockReq.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      const expiredError = new jwt.TokenExpiredError('Token expired', new Date());
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw expiredError;
      });

      authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = mockNext.mock.calls[0][0] as AuthError;
      expect(error.code).toBe(AUTH_TOKEN_EXPIRED);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Token has expired');
    });
  });

  describe('Invalid signature', () => {
    test('should return 401 when token signature is invalid', () => {
      const invalidToken = 'invalid-signature-token';
      mockReq.headers = {
        authorization: `Bearer ${invalidToken}`,
      };

      const invalidError = new jwt.JsonWebTokenError('Invalid token');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw invalidError;
      });

      authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = mockNext.mock.calls[0][0] as AuthError;
      expect(error.code).toBe(AUTH_TOKEN_INVALID);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid token');
    });

    test('should return 401 for unknown jwt verification errors', () => {
      const unknownToken = 'unknown-error-token';
      mockReq.headers = {
        authorization: `Bearer ${unknownToken}`,
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Unknown error');
      });

      authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      const error = mockNext.mock.calls[0][0] as AuthError;
      expect(error.code).toBe(AUTH_TOKEN_INVALID);
      expect(error.message).toBe('Token verification failed');
    });
  });

  describe('optionalAuth middleware', () => {
    test('should set req.user with valid token', () => {
      const validToken = 'valid-token';
      mockReq.headers = {
        authorization: `Bearer ${validToken}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as AuthenticatedRequest).user).toEqual({
        userId: mockUser.userId,
        email: mockUser.email,
        iat: mockUser.iat,
        exp: mockUser.exp,
      });
    });

    test('should call next() without error when no Authorization header', () => {
      mockReq.headers = {};

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as AuthenticatedRequest).user).toBeUndefined();
    });

    test('should call next() without error when invalid token format', () => {
      mockReq.headers = {
        authorization: 'Basic invalid',
      };

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as AuthenticatedRequest).user).toBeUndefined();
    });

    test('should call next() without error when token is expired', () => {
      const expiredToken = 'expired-token';
      mockReq.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('expired', new Date());
      });

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as AuthenticatedRequest).user).toBeUndefined();
    });

    test('should call next() without error when token signature is invalid', () => {
      const invalidToken = 'invalid-token';
      mockReq.headers = {
        authorization: `Bearer ${invalidToken}`,
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid');
      });

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as AuthenticatedRequest).user).toBeUndefined();
    });
  });
});
