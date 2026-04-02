import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { AppError, NotFoundError } from '../errors/AppError';
import { INTERNAL_SERVER_ERROR } from '../constants/errorCodes';

/**
 * Standardized error response format
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

/**
 * Extended error with additional properties
 */
interface ErrorWithDetails extends Error {
  code?: string;
  statusCode?: number;
  details?: Record<string, string[]>;
  isOperational?: boolean;
}

/**
 * Global error handler middleware
 *
 * Handles all errors thrown in the application:
 * - AppError instances: Returns formatted response with appropriate status code
 * - Unknown errors: Returns 500 Internal Server Error
 *
 * In production:
 * - Hides stack traces
 * - Sanitizes error messages for unknown errors
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const isProduction = env.NODE_ENV === 'production';

  // Log the error for debugging
  logError(err, req);

  // Check if it's an AppError instance
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    // Include validation details if present
    const appError = err as AppError & { details?: Record<string, string[]> };
    if (appError.details) {
      (response.error as Record<string, unknown>)['details'] = appError.details;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle errors with similar structure (for compatibility)
  const errorWithDetails = err as ErrorWithDetails;
  if (errorWithDetails.statusCode && errorWithDetails.code) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: errorWithDetails.code,
        message: errorWithDetails.message,
      },
    };

    if (errorWithDetails.details) {
      response.error.details = errorWithDetails.details;
    }

    res.status(errorWithDetails.statusCode).json(response);
    return;
  }

  // Unknown error - return 500 Internal Server Error
  const response: ErrorResponse = {
    success: false,
    error: {
      code: INTERNAL_SERVER_ERROR,
      message: isProduction ? '예상치 못한 오류가 발생했습니다' : err.message,
    },
  };

  // Include stack trace only in development
  if (!isProduction) {
    (response.error as Record<string, unknown>).stack = err.stack;
  }

  res.status(500).json(response);
}

/**
 * Log error details for debugging and monitoring
 */
function logError(err: Error, req: Request): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    message: err.message,
    stack: err.stack,
    isOperational: (err as AppError).isOperational ?? false,
  };

  // Log operational errors as warnings
  if ((err as AppError).isOperational) {
    console.warn('[OPERATIONAL_ERROR]', JSON.stringify(logEntry));
  } else {
    // Log programming/unknown errors as errors
    console.error('[UNHANDLED_ERROR]', JSON.stringify(logEntry));
  }
}

/**
 * Async handler wrapper to catch promise rejections
 *
 * Usage:
 * router.get('/', asyncHandler(async (req, res) => { ... }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create a 404 Not Found handler for unmatched routes
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`${req.method} ${req.path} 경로를 찾을 수 없습니다`));
}
