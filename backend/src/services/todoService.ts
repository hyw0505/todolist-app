import { Pool } from 'pg';
import { TodoRepository, CreateTodoDTO, UpdateTodoDTO, Todo } from '../repositories/todoRepository';
import { addStatusToTodo, addStatusToTodos, TodoWithStatus, TodoStatus } from './todoStatusService';
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/AppError';

/**
 * Todo item with calculated status
 */
export interface TodoItem extends TodoWithStatus<Todo> {}

/**
 * Get todos result with pagination
 */
export interface GetTodosResult {
  todos: TodoItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Todo service for todo CRUD operations
 */
export class TodoService {
  private todoRepository: TodoRepository;

  constructor(pool: Pool) {
    this.todoRepository = new TodoRepository(pool);
  }

  /**
   * Create a new todo
   *
   * @param userId - User ID (owner)
   * @param title - Todo title
   * @param description - Todo description
   * @param startDate - Start date (YYYY-MM-DD)
   * @param dueDate - Due date (YYYY-MM-DD)
   * @returns Created todo with status
   */
  async createTodo(
    userId: string,
    title: string,
    description: string,
    startDate: string,
    dueDate: string,
  ): Promise<TodoItem> {
    const todoData: CreateTodoDTO = {
      user_id: userId,
      title,
      description,
      start_date: startDate,
      due_date: dueDate,
    };

    const todo = await this.todoRepository.insertTodo(todoData);
    return addStatusToTodo(todo);
  }

  /**
   * Get todos list for a user with filtering, sorting, and pagination
   *
   * @param userId - User ID (owner)
   * @param status - Optional status filter
   * @param sortBy - Sort field (start_date or due_date)
   * @param sortOrder - Sort order (asc or desc)
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated todos list
   */
  async getTodos(
    userId: string,
    status?: TodoStatus,
    sortBy: 'start_date' | 'due_date' = 'due_date',
    sortOrder: 'asc' | 'desc' = 'asc',
    page: number = 1,
    limit: number = 10,
  ): Promise<GetTodosResult> {
    if (status) {
      // status 필터 시: 전체 조회 후 런타임 필터 → 페이지네이션 적용
      // (status는 DB에 저장되지 않으므로 정확한 total을 위해 전체 데이터 필요)
      const allRaw = await this.todoRepository.findAllByUserId(userId, sortBy, sortOrder);
      const allWithStatus = addStatusToTodos(allRaw);
      const filtered = allWithStatus.filter((todo) => todo.status === status);

      const total = filtered.length;
      const offset = (page - 1) * limit;
      const pagedTodos = filtered.slice(offset, offset + limit);

      return { todos: pagedTodos, total, page, limit };
    }

    // status 필터 없음: DB 페이지네이션 그대로 사용
    const { todos: rawTodos, total } = await this.todoRepository.findByUserId({
      user_id: userId,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      limit,
    });

    return {
      todos: addStatusToTodos(rawTodos),
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single todo by ID with ownership check
   *
   * @param todoId - Todo ID
   * @param userId - User ID (for ownership check)
   * @returns Todo item with status
   * @throws NotFoundError if todo not found
   * @throws ForbiddenError if user is not owner
   */
  async getTodoById(todoId: string, userId: string): Promise<TodoItem> {
    const todo = await this.todoRepository.findById(todoId);

    if (!todo) {
      throw new NotFoundError('할일을 찾을 수 없습니다');
    }

    // Check ownership
    if (todo.user_id !== userId) {
      throw new ForbiddenError('해당 리소스에 접근할 권한이 없습니다');
    }

    return addStatusToTodo(todo);
  }

  /**
   * Update a todo with partial data
   *
   * @param todoId - Todo ID
   * @param userId - User ID (for ownership check)
   * @param updateData - Partial update data
   * @returns Updated todo with status
   * @throws NotFoundError if todo not found
   * @throws ForbiddenError if user is not owner
   */
  async updateTodo(todoId: string, userId: string, updateData: UpdateTodoDTO): Promise<TodoItem> {
    // Check if at least one field is provided
    const fields = Object.keys(updateData);
    if (fields.length === 0) {
      throw new Error('수정할 필드가 최소 하나 이상 필요합니다');
    }

    // Get existing todo for ownership check and date validation
    const existingTodo = await this.todoRepository.findById(todoId);
    if (!existingTodo) {
      throw new NotFoundError('할일을 찾을 수 없습니다');
    }

    // Check ownership
    if (existingTodo.user_id !== userId) {
      throw new ForbiddenError('해당 리소스에 접근할 권한이 없습니다');
    }

    // Validate date relationship if both dates are being updated
    if (updateData.start_date && updateData.due_date) {
      const startDate = new Date(updateData.start_date);
      const dueDate = new Date(updateData.due_date);
      if (dueDate < startDate) {
        throw new Error('종료일은 시작일과 같거나 이후 날짜여야 합니다');
      }
    } else if (updateData.start_date && !updateData.due_date) {
      // Check new start_date against existing due_date
      const startDate = new Date(updateData.start_date);
      const dueDate = new Date(existingTodo.due_date);
      if (dueDate < startDate) {
        throw new Error('종료일은 시작일과 같거나 이후 날짜여야 합니다');
      }
    } else if (updateData.due_date && !updateData.start_date) {
      // Check new due_date against existing start_date
      const startDate = new Date(existingTodo.start_date);
      const dueDate = new Date(updateData.due_date);
      if (dueDate < startDate) {
        throw new Error('종료일은 시작일과 같거나 이후 날짜여야 합니다');
      }
    }

    const updatedTodo = await this.todoRepository.update(todoId, updateData);
    return addStatusToTodo(updatedTodo);
  }

  /**
   * Mark a todo as completed
   *
   * @param todoId - Todo ID
   * @param userId - User ID (for ownership check)
   * @param isSuccess - Success status
   * @returns Completed todo with status
   * @throws NotFoundError if todo not found
   * @throws ForbiddenError if user is not owner
   * @throws ConflictError if todo is already completed
   */
  async completeTodo(todoId: string, userId: string, isSuccess: boolean): Promise<TodoItem> {
    // Get existing todo
    const existingTodo = await this.todoRepository.findById(todoId);
    if (!existingTodo) {
      throw new NotFoundError('할일을 찾을 수 없습니다');
    }

    // Check ownership
    if (existingTodo.user_id !== userId) {
      throw new ForbiddenError('해당 리소스에 접근할 권한이 없습니다');
    }

    // Check if already completed
    if (existingTodo.is_completed) {
      throw new ConflictError('이미 완료 처리된 할일입니다');
    }

    // Complete the todo (OVERDUE todos can be completed)
    const completedTodo = await this.todoRepository.complete(todoId, isSuccess);
    return addStatusToTodo(completedTodo);
  }

  /**
   * Delete a todo
   *
   * @param todoId - Todo ID
   * @param userId - User ID (for ownership check)
   * @throws NotFoundError if todo not found
   * @throws ForbiddenError if user is not owner
   */
  async deleteTodo(todoId: string, userId: string): Promise<void> {
    // Get existing todo for ownership check
    const existingTodo = await this.todoRepository.findById(todoId);
    if (!existingTodo) {
      throw new NotFoundError('할일을 찾을 수 없습니다');
    }

    // Check ownership
    if (existingTodo.user_id !== userId) {
      throw new ForbiddenError('해당 리소스에 접근할 권한이 없습니다');
    }

    // Delete the todo (CASCADE will handle related data)
    const deleted = await this.todoRepository.delete(todoId);
    if (!deleted) {
      throw new NotFoundError('할일을 찾을 수 없습니다');
    }
  }
}
