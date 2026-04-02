/**
 * Middleware exports
 *
 * Central export point for all middleware functions
 */

// Authentication middleware (BE-05)
export { authenticateToken, optionalAuth, AuthenticatedRequest } from './authenticateToken';

// Rate limiting middleware (BE-06)
export {
  rateLimiter,
  loginRateLimiter,
  apiRateLimiter,
  getRateLimitStatus,
  resetRateLimit,
  clearRateLimitStore,
  RateLimitType,
  RateLimitConfig,
} from './rateLimiter';

// Error handler middleware (BE-07)
export { errorHandler, asyncHandler, notFoundHandler } from './errorHandler';

// Request logging middleware (BE-08)
export { requestLogger, requestLoggerWithOptions, RequestLoggerOptions } from './requestLogger';

// Body validation middleware (BE-09)
export {
  validateBody,
  validateQuery,
  validateParams,
  validate,
  ValidationOptions,
} from './validateBody';
