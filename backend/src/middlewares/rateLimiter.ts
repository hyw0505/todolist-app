import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { RateLimitError } from '../errors/AppError';

/**
 * In-memory store for rate limit tracking
 * Key: IP address, Value: { count, resetTime }
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration types
 */
export type RateLimitType = 'login' | 'api';

export interface RateLimitConfig {
  max: number;
  windowMs: number;
}

/**
 * Default rate limit configurations from env
 */
const rateLimitConfigs: Record<RateLimitType, RateLimitConfig> = {
  login: {
    max: env.RATE_LIMIT_LOGIN_MAX,
    windowMs: 60 * 1000, // 1 minute
  },
  api: {
    max: env.RATE_LIMIT_API_MAX,
    windowMs: env.RATE_LIMIT_WINDOW_MS,
  },
};

/**
 * Get client IP address from request
 * Handles proxied requests with X-Forwarded-For header
 */
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

/**
 * Clean up expired entries from the store
 * Runs periodically to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now >= value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredEntries, 60 * 1000);

/**
 * Rate limiting middleware factory
 *
 * @param type - Type of rate limit ('login' or 'api')
 * @returns Express middleware function
 *
 * Features:
 * - IP-based rate limiting
 * - Returns 429 Too Many Requests when exceeded
 * - Includes RateLimit-Reset header with Unix timestamp
 */
export function rateLimiter(type: RateLimitType = 'api') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = getClientIP(req);
    const config = rateLimitConfigs[type];
    const now = Date.now();

    let entry = rateLimitStore.get(clientIP);

    // Create new entry or reset if window expired
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      rateLimitStore.set(clientIP, entry);
    } else {
      // Increment count within current window
      entry.count++;
    }

    // Set rate limit headers on all responses
    res.set('X-RateLimit-Limit', config.max.toString());
    res.set('X-RateLimit-Remaining', Math.max(0, config.max - entry.count).toString());
    res.set('RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());

    // Check if limit exceeded
    if (entry.count > config.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.set('Retry-After', retryAfter.toString());

      next(
        new RateLimitError(
          `요청 횟수 제한을 초과했습니다. ${retryAfter}초 후에 다시 시도해 주세요.`,
          retryAfter,
        ),
      );
      return;
    }

    next();
  };
}

/**
 * Specific rate limiter for login endpoints (stricter limits)
 */
export const loginRateLimiter = rateLimiter('login');

/**
 * General API rate limiter (standard limits)
 */
export const apiRateLimiter = rateLimiter('api');

/**
 * Get current rate limit status for an IP (useful for debugging/testing)
 */
export function getRateLimitStatus(
  ip: string,
): { count: number; resetTime: number; remaining: number } | null {
  const entry = rateLimitStore.get(ip);
  if (!entry) {
    return null;
  }

  const config = rateLimitConfigs.api; // Default to API config
  return {
    count: entry.count,
    resetTime: entry.resetTime,
    remaining: Math.max(0, config.max - entry.count),
  };
}

/**
 * Reset rate limit for a specific IP (useful for testing)
 */
export function resetRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}

/**
 * Clear all rate limit data (useful for testing)
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}
