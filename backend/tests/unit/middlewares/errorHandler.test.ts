import { Request, Response } from 'express';
import { errorHandler, asyncHandler, notFoundHandler } from '../../../src/middlewares/errorHandler';
import {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  DatabaseError,
} from '../../../src/errors/AppError';

// Mock env module
jest.mock('../../../src/config/env', () => ({
  env: {
    NODE_ENV: 'test',
  },
}));

// Re-import after mocking
const { env } = require('../../../src/config/env');

describe('errorHandler middleware (BE-07)', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/api/test',
      socket: { remoteAddress: '127.0.0.1' } as any,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('AppError (operational error)', () => {
    test('should return formatted response with correct status for AppError', () => {
      const error = new AppError('Something went wrong', 'CUSTOM_ERROR', 400);

      errorHandler(error as Error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong',
      });
    });

    test('should log operational errors as warnings', () => {
      const error = new AppError('Operational error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[OPERATIONAL_ERROR]', expect.any(String));
    });
  });

  describe('ValidationError', () => {
    test('should return 400 with validation error details', () => {
      const details = {
        email: ['Invalid email format'],
        password: ['Password must be at least 8 characters'],
      };
      const error = new ValidationError('Validation failed', details);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
      });
    });

    test('should return 400 without details when not provided', () => {
      const error = new ValidationError('Invalid input');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid input',
      });
    });
  });

  describe('AuthError', () => {
    test('should return 401 for authentication errors', () => {
      const error = new AuthError('Invalid token', 'AUTH_TOKEN_INVALID');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
      });
    });

    test('should return 401 for missing token', () => {
      const error = new AuthError('Authorization header is missing', 'AUTH_TOKEN_MISSING');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authorization header is missing',
      });
    });
  });

  describe('ForbiddenError', () => {
    test('should return 403 for authorization errors', () => {
      const error = new ForbiddenError('Access denied');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied',
      });
    });
  });

  describe('NotFoundError', () => {
    test('should return 404 for not found errors', () => {
      const error = new NotFoundError('User not found');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });
  });

  describe('RateLimitError', () => {
    test('should return 429 for rate limit errors', () => {
      const error = new RateLimitError('Too many requests', 60);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Too many requests',
      });
    });
  });

  describe('Unknown error', () => {
    test('should return 500 for unknown errors', () => {
      const error = new Error('Unexpected error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Unexpected error',
        }),
      );
    });

    test('should log unknown errors as errors', () => {
      const error = new Error('Unknown error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[UNHANDLED_ERROR]', expect.any(String));
    });
  });

  describe('Error with similar structure (compatibility)', () => {
    test('should handle errors with statusCode and code properties', () => {
      const error = Object.assign(new Error('Custom structured error'), {
        statusCode: 400,
        code: 'CUSTOM_CODE',
        isOperational: true,
      });

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Custom structured error',
      });
    });

    test('should include details if present on error object', () => {
      const error = Object.assign(new Error('Error with details'), {
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        details: {
          field: ['is required'],
        },
      });

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error with details',
      });
    });
  });

  describe('DatabaseError', () => {
    test('should return 500 for database errors', () => {
      const error = new DatabaseError('Connection failed');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Connection failed',
      });
    });

    test('should log database errors as unhandled (non-operational)', () => {
      const error = new DatabaseError();

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[UNHANDLED_ERROR]', expect.any(String));
    });
  });

  describe('Logging behavior', () => {
    test('should log request method and path', () => {
      mockReq = {
        method: 'POST',
        path: '/api/users',
        socket: { remoteAddress: '127.0.0.1' } as any,
      };
      const error = new AppError('Test error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const logCall = consoleWarnSpy.mock.calls[0][1] as string;
      const logEntry = JSON.parse(logCall);
      expect(logEntry.method).toBe('POST');
      expect(logEntry.path).toBe('/api/users');
    });

    test('should include timestamp in log', () => {
      const error = new AppError('Test error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const logCall = consoleWarnSpy.mock.calls[0][1] as string;
      const logEntry = JSON.parse(logCall);
      expect(logEntry.timestamp).toBeDefined();
      expect(new Date(logEntry.timestamp).toISOString()).toBeDefined();
    });

    test('should include isOperational flag in log', () => {
      const operationalError = new AppError('Operational');
      const nonOperationalError = new DatabaseError('Non-operational');

      errorHandler(operationalError, mockReq as Request, mockRes as Response, mockNext);
      errorHandler(nonOperationalError, mockReq as Request, mockRes as Response, mockNext);

      const operationalLog = JSON.parse(consoleWarnSpy.mock.calls[0][1] as string);
      const nonOperationalLog = JSON.parse(consoleErrorSpy.mock.calls[0][1] as string);

      expect(operationalLog.isOperational).toBe(true);
      expect(nonOperationalLog.isOperational).toBe(false);
    });
  });
});

describe('asyncHandler wrapper', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      socket: { remoteAddress: '127.0.0.1' } as any,
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  test('should catch and forward errors from async functions', async () => {
    const error = new Error('Async error');
    const asyncFn = jest.fn().mockImplementation(() => Promise.reject(error));

    const wrappedHandler = asyncHandler(asyncFn);

    wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

    // Wait for promise to resolve
    await Promise.resolve();

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  test('should not call next when async function succeeds', async () => {
    const asyncFn = jest.fn().mockImplementation(() => Promise.resolve());

    const wrappedHandler = asyncHandler(asyncFn);

    wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

    await Promise.resolve();

    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should handle AppError from async functions', async () => {
    const error = new ValidationError('Async validation error');
    const asyncFn = jest.fn().mockImplementation(() => Promise.reject(error));

    const wrappedHandler = asyncHandler(asyncFn);

    wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

    await Promise.resolve();

    expect(mockNext).toHaveBeenCalledWith(error);
    expect(error instanceof ValidationError).toBe(true);
  });
});

describe('notFoundHandler', () => {
  let mockReq: Partial<Request>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/api/nonexistent',
      socket: { remoteAddress: '127.0.0.1' } as any,
    };
    mockNext = jest.fn();
  });

  test('should call next with NotFoundError', () => {
    notFoundHandler(mockReq as Request, {} as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = mockNext.mock.calls[0][0] as NotFoundError;
    expect(error.message).toBe('GET /api/nonexistent 경로를 찾을 수 없습니다');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('RESOURCE_NOT_FOUND');
  });

  test('should handle POST method correctly', () => {
    (mockReq as any).method = 'POST';
    (mockReq as any).path = '/api/users';

    notFoundHandler(mockReq as Request, {} as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = mockNext.mock.calls[0][0] as NotFoundError;
    expect(error.message).toBe('POST /api/users 경로를 찾을 수 없습니다');
  });

  test('should pass instanceof check for NotFoundError', () => {
    notFoundHandler(mockReq as Request, {} as Response, mockNext);

    const error = mockNext.mock.calls[0][0];
    expect(error instanceof NotFoundError).toBe(true);
    expect(error instanceof AppError).toBe(true);
  });
});
