import { z } from 'zod';

/**
 * Date string format: YYYY-MM-DD
 */
const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

/**
 * Create todo validation schema
 *
 * Validates:
 * - title: 1-100 characters
 * - description: 0-1000 characters (optional)
 * - start_date: YYYY-MM-DD format
 * - due_date: YYYY-MM-DD format, must be >= start_date
 */
export const createTodoSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(100, 'Title must be at most 100 characters')
      .trim(),

    description: z
      .string()
      .max(1000, 'Description must be at most 1000 characters')
      .optional()
      .default(''),

    start_date: dateStringSchema,

    due_date: dateStringSchema,
  })
  .refine(
    (data) => {
      const startDate = new Date(data.start_date);
      const dueDate = new Date(data.due_date);
      return dueDate >= startDate;
    },
    {
      message: 'due_date must be greater than or equal to start_date',
      path: ['due_date'],
    },
  );

/**
 * Update todo validation schema
 *
 * All fields are optional (partial update)
 * At least one field must be provided (validated in service layer)
 * If both dates are provided, due_date >= start_date validation applies
 */
export const updateTodoSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title must be at least 1 character')
      .max(100, 'Title must be at most 100 characters')
      .trim()
      .optional(),

    description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),

    start_date: dateStringSchema.optional(),

    due_date: dateStringSchema.optional(),
  })
  .refine(
    (data) => {
      // Only validate date relationship if both dates are provided
      if (data.start_date && data.due_date) {
        const startDate = new Date(data.start_date);
        const dueDate = new Date(data.due_date);
        return dueDate >= startDate;
      }
      return true;
    },
    {
      message: 'due_date must be greater than or equal to start_date',
      path: ['due_date'],
    },
  );

/**
 * Complete todo validation schema
 *
 * Validates:
 * - is_success: boolean required
 */
export const completeTodoSchema = z.object({
  is_success: z.boolean({
    required_error: 'is_success is required',
    invalid_type_error: 'is_success must be a boolean',
  }),
});

/**
 * Get todos query parameters schema
 *
 * Validates:
 * - status: optional filter by status
 * - sort_by: start_date or due_date
 * - sort_order: asc or desc
 * - page: positive integer (default: 1)
 * - limit: positive integer 1-100 (default: 20)
 */
export const getTodosQuerySchema = z.object({
  status: z
    .enum(['NOT_STARTED', 'IN_PROGRESS', 'OVERDUE', 'COMPLETED_SUCCESS', 'COMPLETED_FAILURE'])
    .optional(),

  sort_by: z.enum(['start_date', 'due_date']).optional().default('start_date'),

  sort_order: z.enum(['asc', 'desc']).optional().default('asc'),

  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val > 0, 'Page must be a positive integer')
    .default('1'),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .default('20'),
});

/**
 * Todo ID URL parameter schema
 */
export const todoIdParamSchema = z.object({
  id: z.string().uuid('Invalid todo ID format'),
});
