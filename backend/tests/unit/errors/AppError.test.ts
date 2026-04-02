import {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  DatabaseError,
  ConflictError,
} from '../../../src/errors/AppError';
import {
  VALIDATION_ERROR,
  AUTH_TOKEN_INVALID,
  AUTH_FORBIDDEN,
  RESOURCE_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} from '../../../src/constants/errorCodes';

describe('AppError classes (BE-07)', () => {
  describe('AppError base class', () => {
    test('should create AppError with default values', () => {
      const error = new AppError('Something went wrong');

      expect(error.message).toBe('Something went wrong');
      expect(error.code).toBe(INTERNAL_SERVER_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    test('should create AppError with custom values', () => {
      const error = new AppError('Custom error', 'CUSTOM_CODE', 400, true);

      expect(error.message).toBe('Custom error');
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    test('should have proper error stack', () => {
      const error = new AppError('Test error');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack?.includes('AppError')).toBe(true);
    });

    test('should pass instanceof check for AppError', () => {
      const error = new AppError('Test');

      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    test('should maintain prototype chain', () => {
      const error = new AppError('Test');

      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
    });
  });

  describe('ValidationError', () => {
    test('should create ValidationError with default message', () => {
      const error = new ValidationError();

      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe(VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    test('should create ValidationError with custom message', () => {
      const error = new ValidationError('Invalid input data');

      expect(error.message).toBe('Invalid input data');
      expect(error.code).toBe(VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
    });

    test('should include details when provided', () => {
      const details = {
        email: ['Invalid email format'],
        password: ['Password must be at least 8 characters'],
      };
      const error = new ValidationError('Validation failed', details);

      expect(error.details).toEqual(details);
    });

    test('should pass instanceof check for ValidationError', () => {
      const error = new ValidationError();

      expect(error instanceof ValidationError).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });

    test('should have undefined details when not provided', () => {
      const error = new ValidationError();

      expect(error.details).toBeUndefined();
    });
  });

  describe('AuthError', () => {
    test('should create AuthError with default values', () => {
      const error = new AuthError();

      expect(error.message).toBe('Authentication failed');
      expect(error.code).toBe(AUTH_TOKEN_INVALID);
      expect(error.statusCode).toBe(401);
      expect(error.isOperational).toBe(true);
    });

    test('should create AuthError with custom message', () => {
      const error = new AuthError('Token is invalid');

      expect(error.message).toBe('Token is invalid');
      expect(error.code).toBe(AUTH_TOKEN_INVALID);
      expect(error.statusCode).toBe(401);
    });

    test('should create AuthError with AUTH_TOKEN_MISSING code', () => {
      const error = new AuthError('No token provided', 'AUTH_TOKEN_MISSING');

      expect(error.message).toBe('No token provided');
      expect(error.code).toBe('AUTH_TOKEN_MISSING');
      expect(error.statusCode).toBe(401);
    });

    test('should create AuthError with AUTH_TOKEN_EXPIRED code', () => {
      const error = new AuthError('Token expired', 'AUTH_TOKEN_EXPIRED');

      expect(error.message).toBe('Token expired');
      expect(error.code).toBe('AUTH_TOKEN_EXPIRED');
      expect(error.statusCode).toBe(401);
    });

    test('should pass instanceof check for AuthError', () => {
      const error = new AuthError();

      expect(error instanceof AuthError).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });
  });

  describe('ForbiddenError', () => {
    test('should create ForbiddenError with default message', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('Access denied');
      expect(error.code).toBe(AUTH_FORBIDDEN);
      expect(error.statusCode).toBe(403);
      expect(error.isOperational).toBe(true);
    });

    test('should create ForbiddenError with custom message', () => {
      const error = new ForbiddenError('Insufficient permissions');

      expect(error.message).toBe('Insufficient permissions');
      expect(error.code).toBe(AUTH_FORBIDDEN);
      expect(error.statusCode).toBe(403);
    });

    test('should pass instanceof check for ForbiddenError', () => {
      const error = new ForbiddenError();

      expect(error instanceof ForbiddenError).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });
  });

  describe('NotFoundError', () => {
    test('should create NotFoundError with default message', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe(RESOURCE_NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    test('should create NotFoundError with custom message', () => {
      const error = new NotFoundError('User not found');

      expect(error.message).toBe('User not found');
      expect(error.code).toBe(RESOURCE_NOT_FOUND);
      expect(error.statusCode).toBe(404);
    });

    test('should pass instanceof check for NotFoundError', () => {
      const error = new NotFoundError();

      expect(error instanceof NotFoundError).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });
  });

  describe('RateLimitError', () => {
    test('should create RateLimitError with default values', () => {
      const error = new RateLimitError();

      expect(error.message).toBe('Too many requests');
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBeUndefined();
      expect(error.isOperational).toBe(true);
    });

    test('should create RateLimitError with custom message', () => {
      const error = new RateLimitError('Rate limit exceeded for login');

      expect(error.message).toBe('Rate limit exceeded for login');
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.statusCode).toBe(429);
    });

    test('should include retryAfter when provided', () => {
      const error = new RateLimitError('Too many requests', 60);

      expect(error.retryAfter).toBe(60);
    });

    test('should pass instanceof check for RateLimitError', () => {
      const error = new RateLimitError();

      expect(error instanceof RateLimitError).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });
  });

  describe('DatabaseError', () => {
    test('should create DatabaseError with default message', () => {
      const error = new DatabaseError();

      expect(error.message).toBe('Database operation failed');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });

    test('should create DatabaseError with custom message', () => {
      const error = new DatabaseError('Connection timeout');

      expect(error.message).toBe('Connection timeout');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });

    test('should have isOperational set to false', () => {
      const error = new DatabaseError();

      expect(error.isOperational).toBe(false);
    });

    test('should pass instanceof check for DatabaseError', () => {
      const error = new DatabaseError();

      expect(error instanceof DatabaseError).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });
  });

  describe('ConflictError', () => {
    test('should create ConflictError with default message', () => {
      const error = new ConflictError();

      expect(error.message).toBe('Resource conflict');
      expect(error.code).toBe('RESOURCE_CONFLICT');
      expect(error.statusCode).toBe(409);
      expect(error.isOperational).toBe(true);
    });

    test('should create ConflictError with custom message', () => {
      const error = new ConflictError('Email already exists');

      expect(error.message).toBe('Email already exists');
      expect(error.code).toBe('RESOURCE_CONFLICT');
      expect(error.statusCode).toBe(409);
    });

    test('should pass instanceof check for ConflictError', () => {
      const error = new ConflictError();

      expect(error instanceof ConflictError).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });
  });

  describe('isOperational flag', () => {
    test('should be true for all domain errors by default', () => {
      const domainErrors = [
        new ValidationError(),
        new AuthError(),
        new ForbiddenError(),
        new NotFoundError(),
        new RateLimitError(),
        new ConflictError(),
      ];

      domainErrors.forEach((error) => {
        expect(error.isOperational).toBe(true);
      });
    });

    test('should be false for DatabaseError', () => {
      const error = new DatabaseError();
      expect(error.isOperational).toBe(false);
    });

    test('should be customizable in AppError constructor', () => {
      const operationalError = new AppError('Test', 'CODE', 500, true);
      const nonOperationalError = new AppError('Test', 'CODE', 500, false);

      expect(operationalError.isOperational).toBe(true);
      expect(nonOperationalError.isOperational).toBe(false);
    });
  });

  describe('Error inheritance chain', () => {
    test('all error classes should extend Error', () => {
      const errors = [
        new AppError('test'),
        new ValidationError(),
        new AuthError(),
        new ForbiddenError(),
        new NotFoundError(),
        new RateLimitError(),
        new DatabaseError(),
        new ConflictError(),
      ];

      errors.forEach((error) => {
        expect(error instanceof Error).toBe(true);
      });
    });

    test('all error classes should have proper prototype chain', () => {
      expect(Object.getPrototypeOf(new AppError('test'))).toBe(AppError.prototype);
      expect(Object.getPrototypeOf(new ValidationError())).toBe(ValidationError.prototype);
      expect(Object.getPrototypeOf(new AuthError())).toBe(AuthError.prototype);
      expect(Object.getPrototypeOf(new ForbiddenError())).toBe(ForbiddenError.prototype);
      expect(Object.getPrototypeOf(new NotFoundError())).toBe(NotFoundError.prototype);
      expect(Object.getPrototypeOf(new RateLimitError())).toBe(RateLimitError.prototype);
      expect(Object.getPrototypeOf(new DatabaseError())).toBe(DatabaseError.prototype);
      expect(Object.getPrototypeOf(new ConflictError())).toBe(ConflictError.prototype);
    });
  });
});
