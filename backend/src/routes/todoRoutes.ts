import { Router } from 'express';
import { Pool } from 'pg';
import { TodoController } from '../controllers/todoController';
import { authenticateToken } from '../middlewares/authenticateToken';
import { validateBody, validateQuery, validateParams } from '../middlewares/validateBody';
import {
  createTodoSchema,
  updateTodoSchema,
  completeTodoSchema,
  getTodosQuerySchema,
  todoIdParamSchema,
} from '../validators/todoValidator';
import { apiRateLimiter } from '../middlewares/rateLimiter';

/**
 * Create todo routes with authentication, rate limiting, and validation
 *
 * All routes require authentication via JWT token
 *
 * Routes:
 * - POST / - Create new todo
 * - GET / - Get todos list (with filtering, sorting, pagination)
 * - GET /:id - Get todo by ID
 * - PUT /:id - Update todo
 * - POST /:id/complete - Complete todo
 * - DELETE /:id - Delete todo
 */
export function createTodoRoutes(pool: Pool): Router {
  const router = Router();
  const todoController = new TodoController(pool);

  // All routes require authentication
  router.use(authenticateToken);
  router.use(apiRateLimiter);

  // Create todo
  router.post('/', validateBody(createTodoSchema), todoController.createTodo);

  // Get todos list
  router.get('/', validateQuery(getTodosQuerySchema), todoController.getTodos);

  // Get todo by ID
  router.get('/:id', validateParams(todoIdParamSchema), todoController.getTodoById);

  // Update todo
  router.patch(
    '/:id',
    validateParams(todoIdParamSchema),
    validateBody(updateTodoSchema),
    todoController.updateTodo,
  );

  // Complete todo
  router.post(
    '/:id/complete',
    validateParams(todoIdParamSchema),
    validateBody(completeTodoSchema),
    todoController.completeTodo,
  );

  // Delete todo
  router.delete('/:id', validateParams(todoIdParamSchema), todoController.deleteTodo);

  return router;
}
