import {
  INTERNAL_SERVER_ERROR,
  VALIDATION_ERROR,
  AUTH_TOKEN_INVALID,
  AUTH_FORBIDDEN,
  RESOURCE_NOT_FOUND,
} from '../constants/errorCodes';

/**
 * Base application error class with standardized error code and HTTP status
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = INTERNAL_SERVER_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for invalid input data (400 Bad Request)
 */
export class ValidationError extends AppError {
  public readonly details?: Record<string, string[]>;

  constructor(message: string = '입력값 검증에 실패했습니다', details?: Record<string, string[]>) {
    super(message, VALIDATION_ERROR, 400);
    this.details = details;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error for invalid or missing credentials (401 Unauthorized)
 */
export class AuthError extends AppError {
  constructor(message: string = '인증에 실패했습니다', code: string = AUTH_TOKEN_INVALID) {
    super(message, code, 401);
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Authorization error for insufficient permissions (403 Forbidden)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = '접근이 거부되었습니다') {
    super(message, AUTH_FORBIDDEN, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Not found error for missing resources (404 Not Found)
 */
export class NotFoundError extends AppError {
  constructor(message: string = '리소스를 찾을 수 없습니다') {
    super(message, RESOURCE_NOT_FOUND, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Rate limit exceeded error (429 Too Many Requests)
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = '요청 횟수 제한을 초과했습니다', retryAfter?: number) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Database error for persistence layer issues (500 Internal Server Error)
 */
export class DatabaseError extends AppError {
  constructor(message: string = '데이터베이스 작업에 실패했습니다') {
    super(message, 'DATABASE_ERROR', 500, false);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Conflict error for duplicate or conflicting resources (409 Conflict)
 */
export class ConflictError extends AppError {
  constructor(message: string = '리소스 충돌이 발생했습니다') {
    super(message, 'RESOURCE_CONFLICT', 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
