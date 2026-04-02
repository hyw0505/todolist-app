/**
 * Error codes for standardized API error responses
 * Format: {CATEGORY}_{SPECIFIC_ERROR}
 */

// Authentication errors (401)
export const AUTH_TOKEN_MISSING = 'AUTH_TOKEN_MISSING';
export const AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID';
export const AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED';
export const AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS';
export const AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND';

// Authorization errors (403)
export const AUTH_FORBIDDEN = 'AUTH_FORBIDDEN';
export const AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS';

// Validation errors (400)
export const VALIDATION_ERROR = 'VALIDATION_ERROR';
export const VALIDATION_INVALID_INPUT = 'VALIDATION_INVALID_INPUT';

// Resource errors (404)
export const RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND';
export const USER_NOT_FOUND = 'USER_NOT_FOUND';
export const TODO_NOT_FOUND = 'TODO_NOT_FOUND';

// Rate limiting errors (429)
export const RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED';

// Server errors (500)
export const INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR';
export const DATABASE_ERROR = 'DATABASE_ERROR';

// Conflict errors (409)
export const RESOURCE_CONFLICT = 'RESOURCE_CONFLICT';
export const DUPLICATE_ENTRY = 'DUPLICATE_ENTRY';
