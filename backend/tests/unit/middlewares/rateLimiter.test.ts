import { Request, Response } from 'express';
import {
  rateLimiter,
  loginRateLimiter,
  apiRateLimiter,
  getRateLimitStatus,
  resetRateLimit,
  clearRateLimitStore,
} from '../../../src/middlewares/rateLimiter';
import { env } from '../../../src/config/env';
import { RateLimitError } from '../../../src/errors/AppError';

// Mock env
jest.mock('../../../src/config/env', () => ({
  env: {
    RATE_LIMIT_LOGIN_MAX: 5,
    RATE_LIMIT_API_MAX: 60,
    RATE_LIMIT_WINDOW_MS: 60000,
  },
}));

describe('rateLimiter middleware (BE-06)', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
      socket: { remoteAddress: '192.168.1.100' } as any,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    // Clear rate limit store before each test
    clearRateLimitStore();
    jest.clearAllMocks();
  });

  describe('First request within limit', () => {
    test('should call next() for first request', () => {
      const limiter = rateLimiter('api');
      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Limit', '60');
      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '59');
    });

    test('should set rate limit headers correctly', () => {
      const limiter = rateLimiter('api');
      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledTimes(3);
      expect(mockRes.set).toHaveBeenCalledWith('RateLimit-Reset', expect.any(String));
    });
  });

  describe('Requests within limit', () => {
    test('should allow multiple requests within limit', () => {
      const limiter = rateLimiter('api');
      const ip = '192.168.1.101';
      (mockReq as any).ip = ip;

      // Make 10 requests (limit is 60)
      for (let i = 0; i < 10; i++) {
        mockNext.mockReset();
        limiter(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalledWith();
      }

      const status = getRateLimitStatus(ip);
      expect(status?.count).toBe(10);
      expect(status?.remaining).toBe(50);
    });

    test('should decrement remaining count correctly', () => {
      const limiter = rateLimiter('api');
      const ip = '192.168.1.102';
      (mockReq as any).ip = ip;

      // First request
      limiter(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '59');

      // Second request
      mockNext.mockReset();
      limiter(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '58');
    });
  });

  describe('Exceeding login rate limit (5/min)', () => {
    test('should return 429 when login limit exceeded', () => {
      const ip = '192.168.1.200';
      (mockReq as any).ip = ip;
      const limiter = loginRateLimiter;

      // Make 5 requests (at the limit)
      for (let i = 0; i < 5; i++) {
        mockNext.mockReset();
        limiter(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalledWith();
      }

      // 6th request should fail
      mockNext.mockReset();
      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(RateLimitError));
      const error = mockNext.mock.calls[0][0] as RateLimitError;
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    test('should set Retry-After header when limit exceeded', () => {
      const ip = '192.168.1.201';
      (mockReq as any).ip = ip;
      const limiter = loginRateLimiter;

      // Exceed the limit
      for (let i = 0; i < 6; i++) {
        mockNext.mockReset();
        limiter(mockReq as Request, mockRes as Response, mockNext);
      }

      expect(mockRes.set).toHaveBeenCalledWith('Retry-After', expect.any(String));
    });

    test('should include RateLimit-Reset header', () => {
      const ip = '192.168.1.202';
      (mockReq as any).ip = ip;
      const limiter = loginRateLimiter;

      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('RateLimit-Reset', expect.any(String));
    });
  });

  describe('Exceeding API rate limit (60/min)', () => {
    test('should return 429 when API limit exceeded', () => {
      const ip = '192.168.1.210';
      (mockReq as any).ip = ip;
      const limiter = apiRateLimiter;

      // Make 60 requests (at the limit)
      for (let i = 0; i < 60; i++) {
        mockNext.mockReset();
        limiter(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalledWith();
      }

      // 61st request should fail
      mockNext.mockReset();
      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(RateLimitError));
      const error = mockNext.mock.calls[0][0] as RateLimitError;
      expect(error.statusCode).toBe(429);
    });

    test('should set correct remaining count near limit', () => {
      const ip = '192.168.1.211';
      (mockReq as any).ip = ip;
      const limiter = apiRateLimiter;

      // Make 59 requests
      for (let i = 0; i < 59; i++) {
        mockNext.mockReset();
        limiter(mockReq as Request, mockRes as Response, mockNext);
      }

      // 60th request - remaining should be 0
      mockNext.mockReset();
      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '0');
    });
  });

  describe('Rate limit headers', () => {
    test('should include X-RateLimit-Limit header', () => {
      const limiter = rateLimiter('api');
      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Limit', '60');
    });

    test('should include X-RateLimit-Remaining header', () => {
      const limiter = rateLimiter('api');
      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(String));
    });

    test('should include RateLimit-Reset header with Unix timestamp', () => {
      const limiter = rateLimiter('api');
      limiter(mockReq as Request, mockRes as Response, mockNext);

      const resetHeader = (mockRes.set as jest.Mock).mock.calls.find(
        (call: string[]) => call[0] === 'RateLimit-Reset',
      );
      expect(resetHeader).toBeDefined();
      // Should be a Unix timestamp (seconds since epoch)
      const timestamp = parseInt(resetHeader[1], 10);
      expect(timestamp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    test('should include Retry-After header when rate limited', () => {
      const ip = '192.168.1.220';
      (mockReq as any).ip = ip;
      const limiter = loginRateLimiter;

      // Exceed limit
      for (let i = 0; i < 6; i++) {
        mockNext.mockReset();
        limiter(mockReq as Request, mockRes as Response, mockNext);
      }

      expect(mockRes.set).toHaveBeenCalledWith('Retry-After', expect.any(String));
    });
  });

  describe('Client IP detection', () => {
    test('should use X-Forwarded-For header when present', () => {
      mockReq.headers = {
        'x-forwarded-for': '10.0.0.1, 10.0.0.2, 10.0.0.3',
      };

      const limiter = rateLimiter('api');
      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();

      // Verify it tracked the forwarded IP, not the socket IP
      const status = getRateLimitStatus('10.0.0.1');
      expect(status?.count).toBe(1);
    });

    test('should use req.ip when X-Forwarded-For is not present', () => {
      mockReq.headers = {};
      (mockReq as any).ip = '172.16.0.1';

      const limiter = rateLimiter('api');
      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();

      const status = getRateLimitStatus('172.16.0.1');
      expect(status?.count).toBe(1);
    });

    test('should use socket.remoteAddress as fallback', () => {
      mockReq.headers = {};
      (mockReq as any).ip = undefined;

      const limiter = rateLimiter('api');
      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();

      const status = getRateLimitStatus('192.168.1.100');
      expect(status?.count).toBe(1);
    });
  });

  describe('getRateLimitStatus function', () => {
    test('should return null for unknown IP', () => {
      const status = getRateLimitStatus('unknown-ip');
      expect(status).toBeNull();
    });

    test('should return count, resetTime, and remaining for known IP', () => {
      const ip = '192.168.1.230';
      (mockReq as any).ip = ip;
      const limiter = apiRateLimiter;

      limiter(mockReq as Request, mockRes as Response, mockNext);

      const status = getRateLimitStatus(ip);
      expect(status).toBeDefined();
      expect(status?.count).toBe(1);
      expect(status?.resetTime).toBeDefined();
      expect(status?.remaining).toBe(59);
    });
  });

  describe('resetRateLimit function', () => {
    test('should reset rate limit for specific IP', () => {
      const ip = '192.168.1.240';
      (mockReq as any).ip = ip;
      const limiter = apiRateLimiter;

      // Make some requests
      for (let i = 0; i < 5; i++) {
        limiter(mockReq as Request, mockRes as Response, mockNext);
        mockNext.mockReset();
      }

      // Reset
      resetRateLimit(ip);

      // Should be able to make requests again
      mockNext.mockReset();
      limiter(mockReq as Request, mockRes as Response, mockNext);

      const status = getRateLimitStatus(ip);
      expect(status?.count).toBe(1);
    });
  });

  describe('clearRateLimitStore function', () => {
    test('should clear all rate limit data', () => {
      // Make requests from different IPs
      for (let i = 0; i < 3; i++) {
        (mockReq as any).ip = `192.168.1.${250 + i}`;
        const limiter = apiRateLimiter;
        limiter(mockReq as Request, mockRes as Response, mockNext);
        mockNext.mockReset();
      }

      // Clear all
      clearRateLimitStore();

      // All should be null
      for (let i = 0; i < 3; i++) {
        const status = getRateLimitStatus(`192.168.1.${250 + i}`);
        expect(status).toBeNull();
      }
    });
  });

  describe('Different rate limiter types', () => {
    test('login rate limiter should have max of 5', () => {
      const ip = '192.168.1.50';
      (mockReq as any).ip = ip;

      for (let i = 0; i < 5; i++) {
        loginRateLimiter(mockReq as Request, mockRes as Response, mockNext);
        mockNext.mockReset();
      }

      // 6th should fail
      loginRateLimiter(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(RateLimitError));
    });

    test('api rate limiter should have max of 60', () => {
      const ip = '192.168.1.51';
      (mockReq as any).ip = ip;

      for (let i = 0; i < 60; i++) {
        apiRateLimiter(mockReq as Request, mockRes as Response, mockNext);
        mockNext.mockReset();
      }

      // 61st should fail
      apiRateLimiter(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(RateLimitError));
    });
  });
});
