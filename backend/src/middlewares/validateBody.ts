import { NextFunction, Request, Response } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/AppError';

/**
 * Body validation middleware using Zod schemas
 *
 * Validates request body against a Zod schema and:
 * - On success: injects validated data to req.body
 * - On failure: returns 400 Bad Request with detailed error messages
 *
 * @param schema - Zod schema to validate against
 *
 * Usage:
 * router.post('/todos',
 *   validateBody(createTodoSchema),
 *   todoController.create
 * );
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Parse and validate the request body
      const validatedData = schema.parse(req.body);

      // Replace req.body with validated data (strips unknown fields)
      req.body = validatedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Convert Zod errors to detailed validation error
        const details = formatZodErrors(error);
        next(new ValidationError('입력값 검증에 실패했습니다', details));
      } else {
        // Unknown error
        next(new ValidationError('유효하지 않은 요청 본문입니다'));
      }
    }
  };
}

/**
 * Format Zod errors into a structured format
 *
 * Groups errors by field name for easier consumption
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};

  for (const issue of error.issues) {
    // Get the field path as a string (e.g., "user.email")
    const fieldPath = issue.path.join('.');

    // Default to 'body' for root-level errors
    const fieldName = fieldPath || 'body';

    // Add error message to the field's error list
    if (!details[fieldName]) {
      details[fieldName] = [];
    }

    // Create a descriptive error message
    const message = createErrorMessage(issue);
    details[fieldName].push(message);
  }

  return details;
}

/**
 * Create a human-readable error message from a Zod issue
 */
function createErrorMessage(issue: z.ZodIssue): string {
  const { code, message } = issue;

  // Handle specific error codes with custom messages
  switch (code) {
    case 'invalid_type':
      return `예상: ${(issue as z.ZodInvalidTypeIssue).expected}, 실제: ${(issue as z.ZodInvalidTypeIssue).received}`;

    case 'invalid_union':
      return '허용된 타입 중 하나와 일치하지 않습니다';

    case 'invalid_enum_value':
      return `유효하지 않은 값입니다. 다음 중 하나여야 합니다: ${(issue as z.ZodInvalidEnumValueIssue).options.join(', ')}`;

    case 'too_small':
      if (issue.type === 'string') {
        return `문자열은 최소 ${issue.minimum}자 이상이어야 합니다`;
      }
      if (issue.type === 'number') {
        return `숫자는 ${issue.exact ? '이상' : '초과'} ${issue.minimum}이어야 합니다`;
      }
      if (issue.type === 'array') {
        return `배열은 최소 ${issue.minimum}개 이상의 요소를 가져야 합니다`;
      }
      return '값이 너무 작습니다';

    case 'too_big':
      if (issue.type === 'string') {
        return `문자열은 최대 ${issue.maximum}자 이하여야 합니다`;
      }
      if (issue.type === 'number') {
        return `숫자는 ${issue.exact ? '이하' : '미만'} ${issue.maximum}이어야 합니다`;
      }
      if (issue.type === 'array') {
        return `배열은 최대 ${issue.maximum}개 이하의 요소를 가져야 합니다`;
      }
      return '값이 너무 큽니다';

    case 'invalid_string':
      if (issue.validation === 'email') {
        return '유효하지 않은 이메일 주소입니다';
      }
      if (issue.validation === 'url') {
        return '유효하지 않은 URL 입니다';
      }
      if (issue.validation === 'uuid') {
        return '유효하지 않은 UUID 입니다';
      }
      if (issue.validation === 'cuid') {
        return '유효하지 않은 CUID 입니다';
      }
      if (issue.validation === 'regex') {
        return '유효하지 않은 형식입니다';
      }
      return message;

    case 'not_multiple_of':
      return `숫자는 ${(issue as z.ZodNotMultipleOfIssue).multipleOf}의 배수여야 합니다`;

    case 'invalid_date':
      return '유효하지 않은 날짜입니다';

    default:
      return message;
  }
}

/**
 * Validate query parameters using Zod schema
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData as typeof req.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = formatZodErrors(error);
        next(new ValidationError('유효하지 않은 쿼리 파라미터입니다', details));
      } else {
        next(new ValidationError('유효하지 않은 쿼리 파라미터입니다'));
      }
    }
  };
}

/**
 * Validate URL parameters using Zod schema
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = formatZodErrors(error);
        next(new ValidationError('유효하지 않은 URL 파라미터입니다', details));
      } else {
        next(new ValidationError('유효하지 않은 URL 파라미터입니다'));
      }
    }
  };
}

/**
 * Validate multiple parts of a request at once
 */
export interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(options: ValidationOptions) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (options.body) {
        req.body = options.body.parse(req.body);
      }
      if (options.query) {
        req.query = options.query.parse(req.query) as typeof req.query;
      }
      if (options.params) {
        req.params = options.params.parse(req.params) as typeof req.params;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = formatZodErrors(error);
        next(new ValidationError('입력값 검증에 실패했습니다', details));
      } else {
        next(new ValidationError('입력값 검증에 실패했습니다'));
      }
    }
  };
}
