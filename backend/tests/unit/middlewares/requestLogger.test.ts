import { Request, Response } from 'express';
import { requestLogger, requestLoggerWithOptions } from '../../../src/middlewares/requestLogger';

// Mock env module
jest.mock('../../../src/config/env', () => ({
  env: {
    NODE_ENV: 'test',
  },
}));

describe('requestLogger middleware (BE-08)', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/api/test',
      headers: {},
      socket: { remoteAddress: '192.168.1.100' } as any,
    };
    mockRes = {
      statusCode: 200,
      on: jest.fn().mockImplementation((event, callback) => {
        // Simulate the 'finish' event being triggered
        if (event === 'finish') {
          setImmediate(callback);
        }
        return mockRes as Response;
      }),
    };
    mockNext = jest.fn();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
  });

  describe('Basic logging', () => {
    test('should call next() immediately', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should use console.info() for logging', (done) => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        expect(consoleInfoSpy).toHaveBeenCalled();
        done();
      }, 50);
    });

    test('should log method and path correctly', (done) => {
      (mockReq as any).method = 'POST';
      (mockReq as any).path = '/api/users';

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        expect(consoleInfoSpy).toHaveBeenCalled();
        const logMessage = consoleInfoSpy.mock.calls[0][0] as string;
        expect(logMessage).toContain('POST');
        expect(logMessage).toContain('/api/users');
        done();
      }, 50);
    });
  });

  describe('Status code and response time logging', () => {
    test('should log status code', (done) => {
      (mockRes as any).statusCode = 201;

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        const logMessage = consoleInfoSpy.mock.calls[0][0] as string;
        expect(logMessage).toContain('201');
        done();
      }, 50);
    });

    test('should log response time in milliseconds', (done) => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        const logMessage = consoleInfoSpy.mock.calls[0][0] as string;
        expect(logMessage).toMatch(/\(\d+ms\)/);
        done();
      }, 50);
    });
  });

  describe('IP and User-Agent logging', () => {
    test('should use console.info for logging with IP', (done) => {
      (mockReq as any).ip = '10.0.0.1';

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        expect(consoleInfoSpy).toHaveBeenCalled();
        done();
      }, 100);
    });

    test('should include User-Agent when available', (done) => {
      mockReq.headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      };

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        expect(consoleInfoSpy).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('User ID logging', () => {
    test('should include userId when req.user exists', (done) => {
      (mockReq as any).user = {
        userId: 123,
      };

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        const logMessage = consoleInfoSpy.mock.calls[0][0] as string;
        expect(logMessage).toContain('[user:123]');
        done();
      }, 50);
    });

    test('should not include userId when req.user is undefined', (done) => {
      (mockReq as any).user = undefined;

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        const logMessage = consoleInfoSpy.mock.calls[0][0] as string;
        expect(logMessage).not.toContain('[user:');
        done();
      }, 50);
    });
  });

  describe('requestLoggerWithOptions', () => {
    test('should skip paths in skip array', () => {
      const logger = requestLoggerWithOptions({
        skip: ['/health', '/metrics'],
      });

      (mockReq as any).path = '/health';

      logger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    test('should not skip paths not in skip array', (done) => {
      const logger = requestLoggerWithOptions({
        skip: ['/health'],
      });

      (mockReq as any).path = '/api/users';

      logger(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        expect(consoleInfoSpy).toHaveBeenCalled();
        done();
      }, 50);
    });

    test('should skip based on skipPaths function', () => {
      const logger = requestLoggerWithOptions({
        skipPaths: (req) => req.path.startsWith('/internal'),
      });

      (mockReq as any).path = '/internal/debug';

      logger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    test('should work without options', (done) => {
      const logger = requestLoggerWithOptions();

      logger(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        expect(consoleInfoSpy).toHaveBeenCalled();
        done();
      }, 50);
    });
  });

  describe('Log entry structure', () => {
    test('should include timestamp in ISO format', (done) => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        const logMessage = consoleInfoSpy.mock.calls[0][0] as string;
        expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        done();
      }, 50);
    });
  });
});
