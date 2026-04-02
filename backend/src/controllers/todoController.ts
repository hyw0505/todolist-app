import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { TodoService } from '../services/todoService';
import { AuthenticatedRequest } from '../middlewares/authenticateToken';
import { TodoStatus } from '../services/todoStatusService';

/**
 * Todo controller handling HTTP requests for todo operations
 */
export class TodoController {
  private todoService: TodoService;

  constructor(pool: Pool) {
    this.todoService = new TodoService(pool);
  }

  /**
   * Handle create todo
   *
   * POST /api/v1/todos
   * Body: { title, description?, start_date, due_date }
   * Response: { success: true, todo } (201)
   */
  createTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const { title, description, start_date, due_date } = req.body;

      const todo = await this.todoService.createTodo(
        userId,
        title,
        description || '',
        start_date,
        due_date,
      );

      res.status(201).json({
        success: true,
        todo,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle get todos list
   *
   * GET /api/v1/todos?status=&sort_by=&sort_order=&page=&limit=
   * Response: { success: true, data: { todos, total, page, limit } } (200)
   */
  getTodos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;

      const { status, sort_by, sort_order, page, limit } = req.query as unknown as {
        status?: TodoStatus;
        sort_by?: 'start_date' | 'due_date';
        sort_order?: 'asc' | 'desc';
        page?: number;
        limit?: number;
      };

      const result = await this.todoService.getTodos(
        userId,
        status,
        sort_by,
        sort_order,
        page,
        limit,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle get todo by ID
   *
   * GET /api/v1/todos/:id
   * Response: { success: true, todo } (200)
   */
  getTodoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const { id } = req.params;

      const todo = await this.todoService.getTodoById(id, userId);

      res.status(200).json({
        success: true,
        todo,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle update todo
   *
   * PATCH /api/v1/todos/:id
   * Body: { title?, description?, start_date?, due_date? } (at least one field)
   * Response: { success: true, todo } (200)
   */
  updateTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const { id } = req.params;
      const updateData = req.body;

      const todo = await this.todoService.updateTodo(id, userId, updateData);

      res.status(200).json({
        success: true,
        todo,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle complete todo
   *
   * POST /api/v1/todos/:id/complete
   * Body: { is_success: boolean }
   * Response: { success: true, todo } (200)
   */
  completeTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const { id } = req.params;
      const { is_success } = req.body;

      const todo = await this.todoService.completeTodo(id, userId, is_success);

      res.status(200).json({
        success: true,
        todo,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle delete todo
   *
   * DELETE /api/v1/todos/:id
   * Response: 204 No Content
   */
  deleteTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const { id } = req.params;

      await this.todoService.deleteTodo(id, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
