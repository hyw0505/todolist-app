import { Request, Response } from 'express';
import { z } from 'zod';
import {
  validateBody,
  validateQuery,
  validateParams,
  validate,
} from '../../../src/middlewares/validateBody';
import { ValidationError } from '../../../src/errors/AppError';

describe('validateBody middleware (BE-09)', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  // Test schema for validation
  const testSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    age: z.number().int().positive().optional(),
  });

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('Valid body', () => {
    test('should call next() when body is valid', () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should replace req.body with validated data (strips unknown fields)', () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
        unknownField: 'should be removed',
      };

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.body).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    test('should validate all fields correctly', () => {
      mockReq.body = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 25,
      };

      const schemaWithAge = testSchema.extend({
        age: z.number().int().positive(),
      });
      const middleware = validateBody(schemaWithAge);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.body.age).toBe(25);
    });
  });

  describe('Invalid body - missing required field', () => {
    test('should return 400 when required field is missing', () => {
      mockReq.body = {
        email: 'john@example.com',
        // name is missing
      };

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Validation failed');
    });

    test('should include field-specific error for missing name', () => {
      mockReq.body = {
        email: 'john@example.com',
      };

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details).toBeDefined();
      expect(error.details?.name).toBeDefined();
      expect(error.details?.name[0]).toContain('Expected string, received undefined');
    });

    test('should return 400 when multiple required fields are missing', () => {
      mockReq.body = {};

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details).toBeDefined();
      expect(error.details?.name).toBeDefined();
      expect(error.details?.email).toBeDefined();
    });
  });

  describe('Invalid body - wrong type', () => {
    test('should return 400 when field has wrong type', () => {
      mockReq.body = {
        name: 123, // should be string
        email: 'john@example.com',
      };

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details?.name).toBeDefined();
      expect(error.details?.name[0]).toContain('Expected string, received number');
    });

    test('should return 400 when email is invalid format', () => {
      mockReq.body = {
        name: 'John',
        email: 'not-an-email',
      };

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details?.email).toBeDefined();
      expect(error.details?.email[0]).toBe('Invalid email address');
    });

    test('should return 400 when number is not positive', () => {
      const schemaWithRequiredAge = testSchema.extend({
        age: z.number().positive(),
      });

      mockReq.body = {
        name: 'John',
        email: 'john@example.com',
        age: -5,
      };

      const middleware = validateBody(schemaWithRequiredAge);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details?.age).toBeDefined();
    });

    test('should return 400 when string is too short', () => {
      const schemaWithMinLength = z.object({
        name: z.string().min(3, 'Name must be at least 3 characters'),
      });

      mockReq.body = {
        name: 'Jo',
      };

      const middleware = validateBody(schemaWithMinLength);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details?.name).toBeDefined();
      expect(error.details?.name[0]).toContain('at least 3 character');
    });
  });

  describe('Multiple validation errors', () => {
    test('should return all field errors', () => {
      mockReq.body = {
        name: 123, // wrong type
        email: 'invalid-email', // invalid format
      };

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details).toBeDefined();
      expect(error.details?.name).toBeDefined();
      expect(error.details?.email).toBeDefined();
    });

    test('should group multiple errors per field', () => {
      const schemaWithMultipleErrors = z.object({
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters')
          .regex(/[A-Z]/, 'Password must contain uppercase'),
      });

      mockReq.body = {
        password: 'short', // too short and no uppercase
      };

      const middleware = validateBody(schemaWithMultipleErrors);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details?.password).toBeDefined();
      expect(error.details?.password.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Empty body when schema requires fields', () => {
    test('should return 400 when body is empty and schema requires fields', () => {
      mockReq.body = {};

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.statusCode).toBe(400);
    });

    test('should return 400 when body is null', () => {
      mockReq.body = null;

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    test('should return 400 when body is undefined', () => {
      mockReq.body = undefined;

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('Nested object validation', () => {
    test('should validate nested objects', () => {
      const schemaWithNested = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      });

      mockReq.body = {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      };

      const middleware = validateBody(schemaWithNested);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should return error for invalid nested object', () => {
      const schemaWithNested = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      });

      mockReq.body = {
        user: {
          name: 'John',
          email: 'invalid',
        },
      };

      const middleware = validateBody(schemaWithNested);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details?.['user.email']).toBeDefined();
    });
  });

  describe('Array validation', () => {
    test('should validate arrays', () => {
      const schemaWithArray = z.object({
        tags: z.array(z.string()).min(1),
      });

      mockReq.body = {
        tags: ['tag1', 'tag2'],
      };

      const middleware = validateBody(schemaWithArray);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should return error for empty array when min is set', () => {
      const schemaWithArray = z.object({
        tags: z.array(z.string()).min(1, 'At least one tag required'),
      });

      mockReq.body = {
        tags: [],
      };

      const middleware = validateBody(schemaWithArray);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details?.tags).toBeDefined();
    });
  });

  describe('Enum validation', () => {
    test('should validate enum values', () => {
      const schemaWithEnum = z.object({
        status: z.enum(['active', 'inactive', 'pending']),
      });

      mockReq.body = {
        status: 'active',
      };

      const middleware = validateBody(schemaWithEnum);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should return error for invalid enum value', () => {
      const schemaWithEnum = z.object({
        status: z.enum(['active', 'inactive', 'pending']),
      });

      mockReq.body = {
        status: 'invalid',
      };

      const middleware = validateBody(schemaWithEnum);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details?.status).toBeDefined();
      expect(error.details?.status[0]).toContain('Invalid value');
    });
  });

  describe('Unknown error handling', () => {
    test('should handle unknown errors gracefully', () => {
      // Create a schema that throws an unexpected error
      const badSchema = {
        parse: () => {
          throw new Error('Unexpected error');
        },
      };

      const middleware = validateBody(badSchema as unknown as z.ZodSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.message).toBe('Invalid request body');
    });
  });
});

describe('validateQuery middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
  });

  beforeEach(() => {
    mockReq = {
      query: {},
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  test('should validate query parameters', () => {
    mockReq.query = {
      page: '1',
      limit: '20',
      search: 'test',
    };

    const middleware = validateQuery(querySchema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  test('should return 400 for invalid query parameters', () => {
    mockReq.query = {
      page: '-1', // invalid: not positive
      limit: '200', // invalid: exceeds max
    };

    const middleware = validateQuery(querySchema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  test('should replace req.query with validated data', () => {
    mockReq.query = {
      page: '2',
      limit: '50',
    };

    const middleware = validateQuery(querySchema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockReq.query.page).toBe(2);
    expect(mockReq.query.limit).toBe(50);
  });
});

describe('validateParams middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  const paramsSchema = z.object({
    id: z.string().uuid('Invalid UUID format'),
  });

  beforeEach(() => {
    mockReq = {
      params: {},
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  test('should validate URL parameters', () => {
    mockReq.params = {
      id: '550e8400-e29b-41d4-a716-446655440000',
    };

    const middleware = validateParams(paramsSchema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  test('should return 400 for invalid URL parameters', () => {
    mockReq.params = {
      id: 'not-a-uuid',
    };

    const middleware = validateParams(paramsSchema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    const error = mockNext.mock.calls[0][0] as ValidationError;
    expect(error.details?.id).toBeDefined();
  });

  test('should replace req.params with validated data', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    mockReq.params = {
      id: validUuid,
    };

    const middleware = validateParams(paramsSchema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockReq.params.id).toBe(validUuid);
  });
});

describe('validate middleware (combined)', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  const bodySchema = z.object({
    name: z.string().min(1),
  });

  const querySchema = z.object({
    page: z.coerce.number().positive().default(1),
  });

  const paramsSchema = z.object({
    id: z.string().uuid(),
  });

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  test('should validate body, query, and params together', () => {
    mockReq.body = { name: 'Test' };
    mockReq.query = { page: '2' };
    mockReq.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

    const middleware = validate({
      body: bodySchema,
      query: querySchema,
      params: paramsSchema,
    });

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  test('should return 400 when body validation fails', () => {
    mockReq.body = {}; // missing required name
    mockReq.query = { page: '1' };
    mockReq.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

    const middleware = validate({
      body: bodySchema,
      query: querySchema,
      params: paramsSchema,
    });

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  test('should return 400 when query validation fails', () => {
    mockReq.body = { name: 'Test' };
    mockReq.query = { page: '-1' }; // invalid
    mockReq.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

    const middleware = validate({
      body: bodySchema,
      query: querySchema,
      params: paramsSchema,
    });

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  test('should return 400 when params validation fails', () => {
    mockReq.body = { name: 'Test' };
    mockReq.query = { page: '1' };
    mockReq.params = { id: 'invalid-uuid' };

    const middleware = validate({
      body: bodySchema,
      query: querySchema,
      params: paramsSchema,
    });

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  test('should validate only body when only body schema provided', () => {
    mockReq.body = { name: 'Test' };

    const middleware = validate({
      body: bodySchema,
    });

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  test('should validate only query when only query schema provided', () => {
    mockReq.query = { page: '5' };

    const middleware = validate({
      query: querySchema,
    });

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  test('should validate only params when only params schema provided', () => {
    mockReq.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

    const middleware = validate({
      params: paramsSchema,
    });

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });
});
