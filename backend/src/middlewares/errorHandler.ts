import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { AppError, NotFoundError } from '../errors/AppError';

/**
 * Standardized error response format (swagger ErrorResponse 스키마 일치)
 */
interface ErrorResponse {
  success: false;
  message: string;
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
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: { code: err.code },
    });
    return;
  }

  // Handle errors with similar structure (for compatibility)
  const errorWithDetails = err as ErrorWithDetails;
  if (errorWithDetails.statusCode && errorWithDetails.code) {
    const response: ErrorResponse = {
      success: false,
      message: errorWithDetails.message,
    };
    res.status(errorWithDetails.statusCode).json(response);
    return;
  }

  // Unknown error - return 500 Internal Server Error
  const response: ErrorResponse = {
    success: false,
    message: isProduction ? '예상치 못한 오류가 발생했습니다' : err.message,
  };

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
