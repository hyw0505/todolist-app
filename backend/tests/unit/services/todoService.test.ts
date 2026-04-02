import { Pool } from 'pg';
import { TodoService } from '../../../src/services/todoService';
import { TodoRepository } from '../../../src/repositories/todoRepository';
import * as todoStatusService from '../../../src/services/todoStatusService';
import { NotFoundError, ForbiddenError, ConflictError } from '../../../src/errors/AppError';
import { TodoStatus } from '../../../src/services/todoStatusService';

// Mock dependencies
jest.mock('../../../src/repositories/todoRepository');
jest.mock('../../../src/services/todoStatusService');

describe('TodoService (BE-14 through BE-19)', () => {
  let todoService: TodoService;
  let mockPool: Partial<Pool>;
  let mockTodoRepository: jest.Mocked<TodoRepository>;

  const mockUserId = 'user-123';
  const mockTodoId = 'todo-456';

  const mockTodo = {
    id: mockTodoId,
    user_id: mockUserId,
    title: 'Test Todo',
    description: 'Test description',
    start_date: '2024-01-01',
    due_date: '2024-01-31',
    is_completed: false,
    is_success: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockTodoWithStatus = {
    ...mockTodo,
    status: 'IN_PROGRESS' as TodoStatus,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPool = {} as Partial<Pool>;
    mockTodoRepository = new TodoRepository(mockPool as Pool) as jest.Mocked<TodoRepository>;
    (TodoRepository as jest.Mock).mockImplementation(() => mockTodoRepository);

    // Mock status service functions
    jest.spyOn(todoStatusService, 'addStatusToTodo').mockImplementation((todo) => ({
      ...todo,
      status: 'IN_PROGRESS',
    }));
    jest.spyOn(todoStatusService, 'addStatusToTodos').mockImplementation((todos) =>
      todos.map((todo) => ({ ...todo, status: 'IN_PROGRESS' })),
    );

    todoService = new TodoService(mockPool as Pool);
  });

  describe('createTodo', () => {
    const createData = {
      title: 'New Todo',
      description: 'New description',
      startDate: '2024-01-01',
      dueDate: '2024-01-31',
    };

    test('should create todo successfully', async () => {
      mockTodoRepository.insertTodo.mockResolvedValue(mockTodo);

      const result = await todoService.createTodo(
        mockUserId,
        createData.title,
        createData.description,
        createData.startDate,
        createData.dueDate,
      );

      expect(result).toEqual(mockTodoWithStatus);
      expect(mockTodoRepository.insertTodo).toHaveBeenCalledWith({
        user_id: mockUserId,
        title: createData.title,
        description: createData.description,
        start_date: createData.startDate,
        due_date: createData.dueDate,
      });
    });

    test('should call addStatusToTodo on created todo', async () => {
      mockTodoRepository.insertTodo.mockResolvedValue(mockTodo);

      await todoService.createTodo(
        mockUserId,
        createData.title,
        createData.description,
        createData.startDate,
        createData.dueDate,
      );

      expect(todoStatusService.addStatusToTodo).toHaveBeenCalledWith(mockTodo);
      expect(todoStatusService.addStatusToTodo).toHaveBeenCalledTimes(1);
    });

    test('should create todo with empty description', async () => {
      mockTodoRepository.insertTodo.mockResolvedValue(mockTodo);

      await todoService.createTodo(mockUserId, 'Title', '', '2024-01-01', '2024-01-31');

      expect(mockTodoRepository.insertTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          description: '',
        }),
      );
    });

    test('should propagate repository errors', async () => {
      mockTodoRepository.insertTodo.mockRejectedValue(new Error('Database error'));

      await expect(
        todoService.createTodo(mockUserId, 'Title', 'Desc', '2024-01-01', '2024-01-31'),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getTodos', () => {
    const mockTodos = [
      { ...mockTodo, id: 'todo-1', title: 'Todo 1' },
      { ...mockTodo, id: 'todo-2', title: 'Todo 2' },
      { ...mockTodo, id: 'todo-3', title: 'Todo 3' },
    ];

    test('should return todos with status', async () => {
      mockTodoRepository.findByUserId.mockResolvedValue({
        todos: mockTodos,
        total: 3,
      });

      const result = await todoService.getTodos(mockUserId);

      expect(result.todos).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(todoStatusService.addStatusToTodos).toHaveBeenCalledWith(mockTodos);
    });

    test('should use default pagination values', async () => {
      mockTodoRepository.findByUserId.mockResolvedValue({
        todos: mockTodos,
        total: 3,
      });

      await todoService.getTodos(mockUserId);

      expect(mockTodoRepository.findByUserId).toHaveBeenCalledWith({
        user_id: mockUserId,
        sort_by: 'start_date',
        sort_order: 'asc',
        page: 1,
        limit: 20,
      });
    });

    test('should support custom pagination', async () => {
      mockTodoRepository.findByUserId.mockResolvedValue({
        todos: mockTodos,
        total: 3,
      });

      await todoService.getTodos(mockUserId, undefined, 'due_date', 'desc', 2, 10);

      expect(mockTodoRepository.findByUserId).toHaveBeenCalledWith({
        user_id: mockUserId,
        sort_by: 'due_date',
        sort_order: 'desc',
        page: 2,
        limit: 10,
      });
    });

    test('should filter by status after adding status to todos', async () => {
      const todosWithStatus = [
        { ...mockTodos[0], status: 'NOT_STARTED' },
        { ...mockTodos[1], status: 'IN_PROGRESS' },
        { ...mockTodos[2], status: 'OVERDUE' },
      ];

      mockTodoRepository.findByUserId.mockResolvedValue({
        todos: mockTodos,
        total: 3,
      });

      // Override the mock for this specific test
      (todoStatusService.addStatusToTodos as jest.Mock).mockReturnValue(todosWithStatus);

      const result = await todoService.getTodos(mockUserId, 'IN_PROGRESS');

      expect(result.todos).toHaveLength(1);
      expect(result.todos[0].status).toBe('IN_PROGRESS');
      expect(result.total).toBe(1); // Filtered count
    });

    test('should return empty array when no todos', async () => {
      mockTodoRepository.findByUserId.mockResolvedValue({
        todos: [],
        total: 0,
      });

      const result = await todoService.getTodos(mockUserId);

      expect(result.todos).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    test('should filter by all status types', async () => {
      const statuses: TodoStatus[] = [
        'NOT_STARTED',
        'IN_PROGRESS',
        'OVERDUE',
        'COMPLETED_SUCCESS',
        'COMPLETED_FAILURE',
      ];

      for (const status of statuses) {
        jest.clearAllMocks();
        const todosWithStatus = mockTodos.map((t, i) => ({
          ...t,
          status: i === 0 ? status : 'OTHER',
        }));

        mockTodoRepository.findByUserId.mockResolvedValue({
          todos: mockTodos,
          total: 3,
        });
        (todoStatusService.addStatusToTodos as jest.Mock).mockReturnValue(todosWithStatus);

        const result = await todoService.getTodos(mockUserId, status);

        expect(result.todos).toHaveLength(1);
        expect(result.todos[0].status).toBe(status);
      }
    });
  });

  describe('getTodoById', () => {
    test('should return todo with status', async () => {
      mockTodoRepository.findById.mockResolvedValue(mockTodo);

      const result = await todoService.getTodoById(mockTodoId, mockUserId);

      expect(result).toEqual(mockTodoWithStatus);
      expect(todoStatusService.addStatusToTodo).toHaveBeenCalledWith(mockTodo);
    });

    test('should throw NotFoundError when todo not found', async () => {
      mockTodoRepository.findById.mockResolvedValue(undefined);

      await expect(todoService.getTodoById(mockTodoId, mockUserId)).rejects.toThrow(NotFoundError);
      await expect(todoService.getTodoById(mockTodoId, mockUserId)).rejects.toThrow(
        'Todo not found',
      );
    });

    test('should throw ForbiddenError when user is not owner', async () => {
      const otherUserTodo = { ...mockTodo, user_id: 'other-user-id' };
      mockTodoRepository.findById.mockResolvedValue(otherUserTodo);

      await expect(todoService.getTodoById(mockTodoId, mockUserId)).rejects.toThrow(ForbiddenError);
      await expect(todoService.getTodoById(mockTodoId, mockUserId)).rejects.toThrow(
        'You do not have permission to access this todo',
      );
    });

    test('should check ownership before adding status', async () => {
      const otherUserTodo = { ...mockTodo, user_id: 'other-user-id' };
      mockTodoRepository.findById.mockResolvedValue(otherUserTodo);

      try {
        await todoService.getTodoById(mockTodoId, mockUserId);
      } catch (error) {
        // Expected error
      }

      expect(todoStatusService.addStatusToTodo).not.toHaveBeenCalled();
    });
  });

  describe('updateTodo', () => {
    const updateData = {
      title: 'Updated Title',
      description: 'Updated description',
    };

    test('should update todo successfully', async () => {
      const updatedTodo = { ...mockTodo, ...updateData };
      mockTodoRepository.findById.mockResolvedValue(mockTodo);
      mockTodoRepository.update.mockResolvedValue(updatedTodo);

      const result = await todoService.updateTodo(mockTodoId, mockUserId, updateData);

      expect(result).toHaveProperty('status');
      expect(mockTodoRepository.update).toHaveBeenCalledWith(mockTodoId, updateData);
      expect(todoStatusService.addStatusToTodo).toHaveBeenCalled();
    });

    test('should throw NotFoundError when todo not found', async () => {
      mockTodoRepository.findById.mockResolvedValue(undefined);

      await expect(todoService.updateTodo(mockTodoId, mockUserId, updateData)).rejects.toThrow(
        NotFoundError,
      );
    });

    test('should throw ForbiddenError when user is not owner', async () => {
      const otherUserTodo = { ...mockTodo, user_id: 'other-user-id' };
      mockTodoRepository.findById.mockResolvedValue(otherUserTodo);

      await expect(todoService.updateTodo(mockTodoId, mockUserId, updateData)).rejects.toThrow(
        ForbiddenError,
      );
    });

    test('should throw error when no fields provided', async () => {
      mockTodoRepository.findById.mockResolvedValue(mockTodo);

      await expect(todoService.updateTodo(mockTodoId, mockUserId, {})).rejects.toThrow(
        'At least one field must be provided for update',
      );
    });

    test('should validate date relationship when both dates provided', async () => {
      mockTodoRepository.findById.mockResolvedValue(mockTodo);

      const invalidUpdate = {
        start_date: '2024-01-31',
        due_date: '2024-01-01',
      };

      await expect(
        todoService.updateTodo(mockTodoId, mockUserId, invalidUpdate),
      ).rejects.toThrow('due_date must be greater than or equal to start_date');
    });

    test('should validate new start_date against existing due_date', async () => {
      const todoWithEarlyDueDate = { ...mockTodo, due_date: '2024-01-15' };
      mockTodoRepository.findById.mockResolvedValue(todoWithEarlyDueDate);

      const invalidUpdate = {
        start_date: '2024-01-20',
      };

      await expect(
        todoService.updateTodo(mockTodoId, mockUserId, invalidUpdate),
      ).rejects.toThrow('due_date must be greater than or equal to start_date');
    });

    test('should validate new due_date against existing start_date', async () => {
      const todoWithLateStartDate = { ...mockTodo, start_date: '2024-01-20' };
      mockTodoRepository.findById.mockResolvedValue(todoWithLateStartDate);

      const invalidUpdate = {
        due_date: '2024-01-15',
      };

      await expect(
        todoService.updateTodo(mockTodoId, mockUserId, invalidUpdate),
      ).rejects.toThrow('due_date must be greater than or equal to start_date');
    });

    test('should allow valid date updates', async () => {
      mockTodoRepository.findById.mockResolvedValue(mockTodo);
      mockTodoRepository.update.mockResolvedValue({
        ...mockTodo,
        start_date: '2024-02-01',
        due_date: '2024-02-28',
      });

      const validUpdate = {
        start_date: '2024-02-01',
        due_date: '2024-02-28',
      };

      await expect(todoService.updateTodo(mockTodoId, mockUserId, validUpdate)).resolves.toBeDefined();
    });

    test('should update single field', async () => {
      mockTodoRepository.findById.mockResolvedValue(mockTodo);
      mockTodoRepository.update.mockResolvedValue({ ...mockTodo, title: 'Only Title Updated' });

      await todoService.updateTodo(mockTodoId, mockUserId, { title: 'Only Title Updated' });

      expect(mockTodoRepository.update).toHaveBeenCalledWith(mockTodoId, {
        title: 'Only Title Updated',
      });
    });
  });

  describe('completeTodo', () => {
    test('should complete todo with is_success=true', async () => {
      const completedTodo = { ...mockTodo, is_completed: true, is_success: true };
      mockTodoRepository.findById.mockResolvedValue(mockTodo);
      mockTodoRepository.complete.mockResolvedValue(completedTodo);

      const result = await todoService.completeTodo(mockTodoId, mockUserId, true);

      expect(result).toHaveProperty('status');
      expect(result.is_completed).toBe(true);
      expect(result.is_success).toBe(true);
      expect(mockTodoRepository.complete).toHaveBeenCalledWith(mockTodoId, true);
      expect(todoStatusService.addStatusToTodo).toHaveBeenCalledWith(completedTodo);
    });

    test('should complete todo with is_success=false', async () => {
      const completedTodo = { ...mockTodo, is_completed: true, is_success: false };
      mockTodoRepository.findById.mockResolvedValue(mockTodo);
      mockTodoRepository.complete.mockResolvedValue(completedTodo);

      const result = await todoService.completeTodo(mockTodoId, mockUserId, false);

      expect(result).toHaveProperty('status');
      expect(result.is_completed).toBe(true);
      expect(result.is_success).toBe(false);
      expect(mockTodoRepository.complete).toHaveBeenCalledWith(mockTodoId, false);
    });

    test('should throw NotFoundError when todo not found', async () => {
      mockTodoRepository.findById.mockResolvedValue(undefined);

      await expect(todoService.completeTodo(mockTodoId, mockUserId, true)).rejects.toThrow(
        NotFoundError,
      );
    });

    test('should throw ForbiddenError when user is not owner', async () => {
      const otherUserTodo = { ...mockTodo, user_id: 'other-user-id' };
      mockTodoRepository.findById.mockResolvedValue(otherUserTodo);

      await expect(todoService.completeTodo(mockTodoId, mockUserId, true)).rejects.toThrow(
        ForbiddenError,
      );
    });

    test('should throw ConflictError when todo is already completed', async () => {
      const completedTodo = { ...mockTodo, is_completed: true, is_success: true };
      mockTodoRepository.findById.mockResolvedValue(completedTodo);

      await expect(todoService.completeTodo(mockTodoId, mockUserId, true)).rejects.toThrow(
        ConflictError,
      );
      await expect(todoService.completeTodo(mockTodoId, mockUserId, true)).rejects.toThrow(
        'Todo is already completed',
      );
    });

    test('should allow completing overdue todos', async () => {
      const overdueTodo = {
        ...mockTodo,
        start_date: '2024-01-01',
        due_date: '2024-01-15',
        is_completed: false,
      };
      mockTodoRepository.findById.mockResolvedValue(overdueTodo);
      mockTodoRepository.complete.mockResolvedValue({
        ...overdueTodo,
        is_completed: true,
        is_success: true,
      });

      // Mock calculateTodoStatus to return OVERDUE for the initial check
      (todoStatusService.addStatusToTodo as jest.Mock).mockReturnValueOnce({
        ...overdueTodo,
        status: 'OVERDUE',
      });

      await expect(todoService.completeTodo(mockTodoId, mockUserId, true)).resolves.toBeDefined();
    });
  });

  describe('deleteTodo', () => {
    test('should delete todo successfully', async () => {
      mockTodoRepository.findById.mockResolvedValue(mockTodo);
      mockTodoRepository.delete.mockResolvedValue(true);

      await todoService.deleteTodo(mockTodoId, mockUserId);

      expect(mockTodoRepository.delete).toHaveBeenCalledWith(mockTodoId);
    });

    test('should throw NotFoundError when todo not found', async () => {
      mockTodoRepository.findById.mockResolvedValue(undefined);

      await expect(todoService.deleteTodo(mockTodoId, mockUserId)).rejects.toThrow(NotFoundError);
    });

    test('should throw ForbiddenError when user is not owner', async () => {
      const otherUserTodo = { ...mockTodo, user_id: 'other-user-id' };
      mockTodoRepository.findById.mockResolvedValue(otherUserTodo);

      await expect(todoService.deleteTodo(mockTodoId, mockUserId)).rejects.toThrow(ForbiddenError);
    });

    test('should throw NotFoundError if delete returns false', async () => {
      mockTodoRepository.findById.mockResolvedValue(mockTodo);
      mockTodoRepository.delete.mockResolvedValue(false);

      await expect(todoService.deleteTodo(mockTodoId, mockUserId)).rejects.toThrow(NotFoundError);
    });

    test('should check ownership before deleting', async () => {
      const otherUserTodo = { ...mockTodo, user_id: 'other-user-id' };
      mockTodoRepository.findById.mockResolvedValue(otherUserTodo);

      try {
        await todoService.deleteTodo(mockTodoId, mockUserId);
      } catch (error) {
        // Expected error
      }

      expect(mockTodoRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('Integration between service and status functions', () => {
    test('should correctly add COMPLETED_SUCCESS status after completing todo', async () => {
      mockTodoRepository.findById.mockResolvedValue(mockTodo);
      const completedTodo = { ...mockTodo, is_completed: true, is_success: true };
      mockTodoRepository.complete.mockResolvedValue(completedTodo);

      // Mock addStatusToTodo to return COMPLETED_SUCCESS for completed todo
      (todoStatusService.addStatusToTodo as jest.Mock).mockImplementation((todo) => ({
        ...todo,
        status: todo.is_completed && todo.is_success ? 'COMPLETED_SUCCESS' : 'IN_PROGRESS',
      }));

      const result = await todoService.completeTodo(mockTodoId, mockUserId, true);

      expect(result.status).toBe('COMPLETED_SUCCESS');
    });

    test('should correctly add COMPLETED_FAILURE status after completing todo', async () => {
      mockTodoRepository.findById.mockResolvedValue(mockTodo);
      const completedTodo = { ...mockTodo, is_completed: true, is_success: false };
      mockTodoRepository.complete.mockResolvedValue(completedTodo);

      // Mock addStatusToTodo to return COMPLETED_FAILURE for failed todo
      (todoStatusService.addStatusToTodo as jest.Mock).mockImplementation((todo) => ({
        ...todo,
        status: todo.is_completed && !todo.is_success ? 'COMPLETED_FAILURE' : 'IN_PROGRESS',
      }));

      const result = await todoService.completeTodo(mockTodoId, mockUserId, false);

      expect(result.status).toBe('COMPLETED_FAILURE');
    });
  });
});
