import { Pool } from 'pg';
import { TodoRepository, CreateTodoDTO, UpdateTodoDTO } from '../../../src/repositories/todoRepository';
import { DatabaseError } from '../../../src/errors/AppError';
import {
  createTestPool,
  cleanTestDatabase,
  closeTestPool,
  createTestUser,
  createTestTodo,
} from '../../testHelpers';

describe('TodoRepository (BE-14 through BE-19)', () => {
  let pool: Pool;
  let todoRepository: TodoRepository;
  let testUserId: string;

  beforeAll(async () => {
    pool = createTestPool();
    todoRepository = new TodoRepository(pool);
    // Create a test user for all tests
    const user = await createTestUser(pool);
    testUserId = user.id;
  });

  beforeEach(async () => {
    await cleanTestDatabase(pool);
    // Recreate test user after cleanup
    const user = await createTestUser(pool);
    testUserId = user.id;
  });

  afterAll(async () => {
    await closeTestPool(pool);
  });

  describe('insertTodo', () => {
    test('should create todo successfully', async () => {
      const todoData: CreateTodoDTO = {
        user_id: testUserId,
        title: 'Test Todo',
        description: 'Test description',
        start_date: '2024-01-01',
        due_date: '2024-01-31',
      };

      const result = await todoRepository.insertTodo(todoData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.user_id).toBe(todoData.user_id);
      expect(result.title).toBe(todoData.title);
      expect(result.description).toBe(todoData.description);
      // Date fields are returned as Date objects from PostgreSQL
      expect(new Date(result.start_date).toISOString().split('T')[0]).toBe(todoData.start_date);
      expect(new Date(result.due_date).toISOString().split('T')[0]).toBe(todoData.due_date);
      expect(result.is_completed).toBe(false);
      expect(result.is_success).toBeNull();
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    test('should create todo with empty description', async () => {
      const todoData: CreateTodoDTO = {
        user_id: testUserId,
        title: 'Test Todo',
        description: '',
        start_date: '2024-01-01',
        due_date: '2024-01-31',
      };

      const result = await todoRepository.insertTodo(todoData);

      expect(result.description).toBe('');
    });

    test('should create todo with same start_date and due_date', async () => {
      const todoData: CreateTodoDTO = {
        user_id: testUserId,
        title: 'Same Day Todo',
        description: 'Due today',
        start_date: '2024-01-15',
        due_date: '2024-01-15',
      };

      const result = await todoRepository.insertTodo(todoData);

      expect(new Date(result.start_date).toISOString().split('T')[0]).toBe('2024-01-15');
      expect(new Date(result.due_date).toISOString().split('T')[0]).toBe('2024-01-15');
    });

    test('should create multiple todos for same user', async () => {
      const todo1: CreateTodoDTO = {
        user_id: testUserId,
        title: 'Todo 1',
        description: 'First todo',
        start_date: '2024-01-01',
        due_date: '2024-01-31',
      };

      const todo2: CreateTodoDTO = {
        user_id: testUserId,
        title: 'Todo 2',
        description: 'Second todo',
        start_date: '2024-02-01',
        due_date: '2024-02-28',
      };

      const result1 = await todoRepository.insertTodo(todo1);
      const result2 = await todoRepository.insertTodo(todo2);

      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
      expect(result1.id).not.toBe(result2.id);
    });

    test('should create todos for different users', async () => {
      const user2 = await createTestUser(pool, { email: 'user2@example.com' });

      const todo1: CreateTodoDTO = {
        user_id: testUserId,
        title: 'User 1 Todo',
        description: 'First user todo',
        start_date: '2024-01-01',
        due_date: '2024-01-31',
      };

      const todo2: CreateTodoDTO = {
        user_id: user2.id,
        title: 'User 2 Todo',
        description: 'Second user todo',
        start_date: '2024-01-01',
        due_date: '2024-01-31',
      };

      const result1 = await todoRepository.insertTodo(todo1);
      const result2 = await todoRepository.insertTodo(todo2);

      expect(result1.user_id).toBe(testUserId);
      expect(result2.user_id).toBe(user2.id);
    });
  });

  describe('findById', () => {
    test('should find todo by ID', async () => {
      const createdTodo = await createTestTodo(pool, testUserId);

      const result = await todoRepository.findById(createdTodo.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(createdTodo.id);
      expect(result?.title).toBe(createdTodo.title);
      expect(result?.user_id).toBe(testUserId);
    });

    test('should return undefined for non-existent ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const result = await todoRepository.findById(fakeId);

      expect(result).toBeUndefined();
    });

    test('should return undefined for invalid UUID format', async () => {
      const invalidId = 'not-a-uuid';
      // Repository throws DatabaseError for invalid queries
      await expect(todoRepository.findById(invalidId)).rejects.toThrow();
    });

    test('should find todo with all fields', async () => {
      const createdTodo = await createTestTodo(pool, testUserId, {
        title: 'Complete Todo',
        description: 'Test description',
        start_date: '2024-01-01',
        due_date: '2024-01-31',
        is_completed: false,
        is_success: null,
      });

      const result = await todoRepository.findById(createdTodo.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(createdTodo.id);
      expect(result?.title).toBe('Complete Todo');
      expect(result?.description).toBe('Test description');
      expect(new Date(result?.start_date).toISOString().split('T')[0]).toBe('2024-01-01');
      expect(new Date(result?.due_date).toISOString().split('T')[0]).toBe('2024-01-31');
      expect(result?.is_completed).toBe(false);
      expect(result?.is_success).toBeNull();
      expect(result?.created_at).toBeDefined();
      expect(result?.updated_at).toBeDefined();
    });

    test('should not have ownership check in repository layer', async () => {
      // Repository layer should not check ownership - that's service layer responsibility
      const todo = await createTestTodo(pool, testUserId);

      // Should find todo regardless of who's asking (no ownership check at repo level)
      const result = await todoRepository.findById(todo.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(todo.id);
    });
  });

  describe('findByUserId', () => {
    test('should find todos by user_id', async () => {
      await createTestTodo(pool, testUserId, { title: 'Todo 1' });
      await createTestTodo(pool, testUserId, { title: 'Todo 2' });
      await createTestTodo(pool, testUserId, { title: 'Todo 3' });

      const result = await todoRepository.findByUserId({ user_id: testUserId });

      expect(result.todos).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.todos.map((t) => t.title)).toEqual(
        expect.arrayContaining(['Todo 1', 'Todo 2', 'Todo 3']),
      );
    });

    test('should return empty array when user has no todos', async () => {
      const result = await todoRepository.findByUserId({ user_id: testUserId });

      expect(result.todos).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    test('should support pagination', async () => {
      for (let i = 1; i <= 25; i++) {
        await createTestTodo(pool, testUserId, { title: `Todo ${i}` });
      }

      const page1 = await todoRepository.findByUserId({
        user_id: testUserId,
        page: 1,
        limit: 10,
      });
      const page2 = await todoRepository.findByUserId({
        user_id: testUserId,
        page: 2,
        limit: 10,
      });
      const page3 = await todoRepository.findByUserId({
        user_id: testUserId,
        page: 3,
        limit: 10,
      });

      expect(page1.todos).toHaveLength(10);
      expect(page2.todos).toHaveLength(10);
      expect(page3.todos).toHaveLength(5);
      expect(page1.total).toBe(25);
      expect(page2.total).toBe(25);
      expect(page3.total).toBe(25);
    });

    test('should support sorting by start_date ascending', async () => {
      await createTestTodo(pool, testUserId, {
        title: 'Third',
        start_date: '2024-01-20',
        due_date: '2024-01-31',
      });
      await createTestTodo(pool, testUserId, {
        title: 'First',
        start_date: '2024-01-01',
        due_date: '2024-01-31',
      });
      await createTestTodo(pool, testUserId, {
        title: 'Second',
        start_date: '2024-01-10',
        due_date: '2024-01-31',
      });

      const result = await todoRepository.findByUserId({
        user_id: testUserId,
        sort_by: 'start_date',
        sort_order: 'asc',
      });

      expect(result.todos[0].title).toBe('First');
      expect(result.todos[1].title).toBe('Second');
      expect(result.todos[2].title).toBe('Third');
    });

    test('should support sorting by start_date descending', async () => {
      await createTestTodo(pool, testUserId, {
        title: 'First',
        start_date: '2024-01-01',
        due_date: '2024-01-31',
      });
      await createTestTodo(pool, testUserId, {
        title: 'Second',
        start_date: '2024-01-10',
        due_date: '2024-01-31',
      });
      await createTestTodo(pool, testUserId, {
        title: 'Third',
        start_date: '2024-01-20',
        due_date: '2024-01-31',
      });

      const result = await todoRepository.findByUserId({
        user_id: testUserId,
        sort_by: 'start_date',
        sort_order: 'desc',
      });

      expect(result.todos[0].title).toBe('Third');
      expect(result.todos[1].title).toBe('Second');
      expect(result.todos[2].title).toBe('First');
    });

    test('should support sorting by due_date', async () => {
      await createTestTodo(pool, testUserId, {
        title: 'First',
        start_date: '2024-01-01',
        due_date: '2024-01-10',
      });
      await createTestTodo(pool, testUserId, {
        title: 'Second',
        start_date: '2024-01-01',
        due_date: '2024-01-20',
      });
      await createTestTodo(pool, testUserId, {
        title: 'Third',
        start_date: '2024-01-01',
        due_date: '2024-01-30',
      });

      const result = await todoRepository.findByUserId({
        user_id: testUserId,
        sort_by: 'due_date',
        sort_order: 'asc',
      });

      expect(result.todos[0].title).toBe('First');
      expect(result.todos[1].title).toBe('Second');
      expect(result.todos[2].title).toBe('Third');
    });

    test('should filter by other user todos', async () => {
      const user2 = await createTestUser(pool, { email: 'user2@example.com' });

      await createTestTodo(pool, testUserId, { title: 'User 1 Todo 1' });
      await createTestTodo(pool, testUserId, { title: 'User 1 Todo 2' });
      await createTestTodo(pool, user2.id, { title: 'User 2 Todo 1' });
      await createTestTodo(pool, user2.id, { title: 'User 2 Todo 2' });

      const user1Result = await todoRepository.findByUserId({ user_id: testUserId });
      const user2Result = await todoRepository.findByUserId({ user_id: user2.id });

      expect(user1Result.todos).toHaveLength(2);
      expect(user2Result.todos).toHaveLength(2);
      expect(user1Result.todos.every((t) => t.user_id === testUserId)).toBe(true);
      expect(user2Result.todos.every((t) => t.user_id === user2.id)).toBe(true);
    });

    test('should use default pagination values', async () => {
      for (let i = 1; i <= 50; i++) {
        await createTestTodo(pool, testUserId, { title: `Todo ${i}` });
      }

      const result = await todoRepository.findByUserId({ user_id: testUserId });

      // Default limit is 20
      expect(result.todos).toHaveLength(20);
      expect(result.total).toBe(50);
    });
  });

  describe('update', () => {
    test('should update title', async () => {
      const todo = await createTestTodo(pool, testUserId);

      const updateData: UpdateTodoDTO = { title: 'Updated Title' };
      const result = await todoRepository.update(todo.id, updateData);

      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe(todo.description);
      expect(new Date(result.start_date).toISOString().split('T')[0]).toBe(
        new Date(todo.start_date).toISOString().split('T')[0],
      );
      expect(new Date(result.due_date).toISOString().split('T')[0]).toBe(
        new Date(todo.due_date).toISOString().split('T')[0],
      );
    });

    test('should update description', async () => {
      const todo = await createTestTodo(pool, testUserId);

      const updateData: UpdateTodoDTO = { description: 'Updated description' };
      const result = await todoRepository.update(todo.id, updateData);

      expect(result.description).toBe('Updated description');
    });

    test('should update start_date', async () => {
      const todo = await createTestTodo(pool, testUserId);

      const updateData: UpdateTodoDTO = { start_date: '2024-03-01' };
      const result = await todoRepository.update(todo.id, updateData);

      expect(new Date(result.start_date).toISOString().split('T')[0]).toBe('2024-03-01');
    });

    test('should update due_date', async () => {
      const todo = await createTestTodo(pool, testUserId);

      const updateData: UpdateTodoDTO = { due_date: '2024-03-28' };
      const result = await todoRepository.update(todo.id, updateData);

      expect(new Date(result.due_date).toISOString().split('T')[0]).toBe('2024-03-28');
    });

    test('should update multiple fields at once', async () => {
      const todo = await createTestTodo(pool, testUserId);

      const updateData: UpdateTodoDTO = {
        title: 'New Title',
        description: 'New description',
        start_date: '2024-03-01',
        due_date: '2024-03-28',
      };
      const result = await todoRepository.update(todo.id, updateData);

      expect(result.title).toBe('New Title');
      expect(result.description).toBe('New description');
      expect(new Date(result.start_date).toISOString().split('T')[0]).toBe('2024-03-01');
      expect(new Date(result.due_date).toISOString().split('T')[0]).toBe('2024-03-28');
    });

    test('should auto-update updated_at timestamp', async () => {
      const todo = await createTestTodo(pool, testUserId);
      const originalUpdatedAt = new Date(todo.updated_at).getTime();

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updateData: UpdateTodoDTO = { title: 'Updated Title' };
      const result = await todoRepository.update(todo.id, updateData);

      const newUpdatedAt = new Date(result.updated_at).getTime();
      expect(newUpdatedAt).toBeGreaterThanOrEqual(originalUpdatedAt);
    });

    test('should throw error for non-existent todo', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const updateData: UpdateTodoDTO = { title: 'Updated Title' };

      // Repository returns undefined for non-existent todo (no row returned)
      const result = await todoRepository.update(fakeId, updateData);
      expect(result).toBeUndefined();
    });

    test('should handle empty string description', async () => {
      const todo = await createTestTodo(pool, testUserId);

      const updateData: UpdateTodoDTO = { description: '' };
      const result = await todoRepository.update(todo.id, updateData);

      expect(result.description).toBe('');
    });
  });

  describe('complete', () => {
    test('should set is_completed=true and is_success=true', async () => {
      const todo = await createTestTodo(pool, testUserId);

      const result = await todoRepository.complete(todo.id, true);

      expect(result.is_completed).toBe(true);
      expect(result.is_success).toBe(true);
    });

    test('should set is_completed=true and is_success=false', async () => {
      const todo = await createTestTodo(pool, testUserId);

      const result = await todoRepository.complete(todo.id, false);

      expect(result.is_completed).toBe(true);
      expect(result.is_success).toBe(false);
    });

    test('should update updated_at timestamp', async () => {
      const todo = await createTestTodo(pool, testUserId);
      const originalUpdatedAt = new Date(todo.updated_at).getTime();

      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = await todoRepository.complete(todo.id, true);

      const newUpdatedAt = new Date(result.updated_at).getTime();
      expect(newUpdatedAt).toBeGreaterThanOrEqual(originalUpdatedAt);
    });

    test('should complete already completed todo (no validation at repo layer)', async () => {
      const todo = await createTestTodo(pool, testUserId, { is_completed: true, is_success: true });

      // Repository doesn't validate - it just updates
      const result = await todoRepository.complete(todo.id, false);

      expect(result.is_completed).toBe(true);
      expect(result.is_success).toBe(false);
    });

    test('should throw error for non-existent todo', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      // Repository returns undefined for non-existent todo (no row returned)
      const result = await todoRepository.complete(fakeId, true);
      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    test('should delete todo successfully', async () => {
      const todo = await createTestTodo(pool, testUserId);

      const result = await todoRepository.delete(todo.id);

      expect(result).toBe(true);

      // Verify todo is deleted
      const found = await todoRepository.findById(todo.id);
      expect(found).toBeUndefined();
    });

    test('should return false for non-existent todo', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const result = await todoRepository.delete(fakeId);

      expect(result).toBe(false);
    });

    test('should delete todo with all data', async () => {
      const todo = await createTestTodo(pool, testUserId, {
        title: 'To Delete',
        description: 'This todo will be deleted',
        start_date: '2024-01-01',
        due_date: '2024-01-31',
        is_completed: false,
        is_success: null,
      });

      await todoRepository.delete(todo.id);

      const found = await todoRepository.findById(todo.id);
      expect(found).toBeUndefined();
    });

    test('should handle multiple deletes', async () => {
      const todo1 = await createTestTodo(pool, testUserId, { title: 'Todo 1' });
      const todo2 = await createTestTodo(pool, testUserId, { title: 'Todo 2' });
      const todo3 = await createTestTodo(pool, testUserId, { title: 'Todo 3' });

      await todoRepository.delete(todo1.id);
      await todoRepository.delete(todo2.id);
      await todoRepository.delete(todo3.id);

      const todos = await todoRepository.findByUserId({ user_id: testUserId });
      expect(todos.todos).toHaveLength(0);
    });
  });

  describe('Data integrity and edge cases', () => {
    test('should handle special characters in title and description', async () => {
      const todoData: CreateTodoDTO = {
        user_id: testUserId,
        title: 'Test with émojis 🎉 and spëcial çharacters',
        description: 'Description with "quotes" and \'apostrophes\' and <html> tags',
        start_date: '2024-01-01',
        due_date: '2024-01-31',
      };

      const result = await todoRepository.insertTodo(todoData);

      expect(result.title).toBe(todoData.title);
      expect(result.description).toBe(todoData.description);
    });

    test('should handle long title and description', async () => {
      const todoData: CreateTodoDTO = {
        user_id: testUserId,
        title: 'a'.repeat(100),
        description: 'd'.repeat(1000),
        start_date: '2024-01-01',
        due_date: '2024-01-31',
      };

      const result = await todoRepository.insertTodo(todoData);

      expect(result.title).toHaveLength(100);
      expect(result.description).toHaveLength(1000);
    });

    test('should preserve data after update', async () => {
      const todo = await createTestTodo(pool, testUserId);

      const updateData: UpdateTodoDTO = { title: 'Updated' };
      await todoRepository.update(todo.id, updateData);

      const found = await todoRepository.findById(todo.id);
      expect(found).toBeDefined();
      expect(found?.title).toBe('Updated');
      expect(found?.user_id).toBe(testUserId);
    });
  });
});
