import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

/**
 * Log entry structure for structured logging
 */
interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  responseTimeMs: number;
  ip?: string;
  userAgent?: string;
  userId?: number;
}

/**
 * Request logging middleware
 *
 * Logs each HTTP request with:
 * - HTTP method and path
 * - Response status code
 * - Response time in milliseconds
 * - Client IP and User-Agent (optional)
 * - User ID if authenticated (optional)
 *
 * Uses console.info() for structured output
 * Suppresses console.log() in production
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const isProduction = env.NODE_ENV === 'production';

  // Listen for the 'finish' event to log after response is sent
  res.on('finish', () => {
    // Calculate response time
    const responseTimeMs = Date.now() - startTime;

    // Create log entry
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTimeMs,
    };

    // Add optional fields
    const clientIP = getClientIP(req);
    if (clientIP && clientIP !== 'unknown') {
      logEntry.ip = clientIP;
    }

    const userAgent = req.headers['user-agent'];
    if (userAgent) {
      logEntry.userAgent = userAgent;
    }

    // Add user ID if authenticated
    if ('user' in req && req.user && typeof req.user === 'object' && 'userId' in req.user) {
      logEntry.userId = (req.user as { userId: number }).userId;
    }

    // Log based on status code
    logRequest(logEntry, isProduction);
  });

  next();
}

/**
 * Get client IP address from request
 */
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

/**
 * Log the request entry
 *
 * In production: Only use console.info for structured output
 * In development: Use console.info with formatted output
 */
function logRequest(entry: LogEntry, isProduction: boolean): void {
  // Suppress console.log in production, use only console.info
  if (isProduction) {
    // Structured JSON output for production logging systems
    console.info(JSON.stringify(entry));
  } else {
    // Human-readable format for development
    const logColor = getStatusCodeColor(entry.statusCode);
    const logMessage =
      `[${entry.timestamp}] ${entry.method} ${entry.path} ` +
      `${logColor}${entry.statusCode}\x1b[0m ` +
      `(${entry.responseTimeMs}ms)` +
      (entry.userId ? ` [user:${entry.userId}]` : '');

    console.info(logMessage);
  }
}

/**
 * Get ANSI color code for status code
 */
function getStatusCodeColor(statusCode: number): string {
  if (statusCode >= 500) {
    return '\x1b[31m'; // Red for 5xx
  }
  if (statusCode >= 400) {
    return '\x1b[33m'; // Yellow for 4xx
  }
  if (statusCode >= 300) {
    return '\x1b[36m'; // Cyan for 3xx
  }
  return '\x1b[32m'; // Green for 1xx and 2xx
}

/**
 * Skip logging for specific paths
 *
 * Usage: app.use(requestLogger({ skip: ['/health', '/metrics'] }));
 */
export interface RequestLoggerOptions {
  skip?: string[];
  skipPaths?: (req: Request) => boolean;
}

export function requestLoggerWithOptions(options?: RequestLoggerOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if this request should be skipped
    if (options?.skip?.includes(req.path)) {
      return next();
    }

    if (options?.skipPaths?.(req)) {
      return next();
    }

    requestLogger(req, res, next);
  };
}
