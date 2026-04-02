import request from 'supertest';
import { Pool } from 'pg';
import { createApp } from '../../src/app';
import { pool } from '../../src/config/database';
import { cleanTestDatabase, createTestUser } from '../testHelpers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('Todo Integration Tests (BE-14 through BE-19)', () => {
  let app: any;
  let testPool: Pool;

  let user1: { id: string; email: string; password: string; name: string };
  let user2: { id: string; email: string; password: string; name: string };
  let user1AccessToken: string;
  let user2AccessToken: string;

  const validTodoData = {
    title: 'Test Todo',
    description: 'Test description',
    start_date: '2024-01-01',
    due_date: '2024-01-31',
  };

  beforeAll(async () => {
    testPool = pool;
    app = createApp(testPool);

    // Create two test users
    const hashedPassword = await bcrypt.hash('SecurePassword123!', 10);

    const user1Result = await testPool.query(
      `
      INSERT INTO users (email, password, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, password, name
    `,
      ['user1-todos@example.com', hashedPassword, 'User 1'],
    );
    user1 = user1Result.rows[0];

    const user2Result = await testPool.query(
      `
      INSERT INTO users (email, password, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, password, name
    `,
      ['user2-todos@example.com', hashedPassword, 'User 2'],
    );
    user2 = user2Result.rows[0];

    // Generate access tokens
    user1AccessToken = jwt.sign(
      { sub: user1.id, email: user1.email },
      env.JWT_ACCESS_SECRET as string,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as string },
    );

    user2AccessToken = jwt.sign(
      { sub: user2.id, email: user2.email },
      env.JWT_ACCESS_SECRET as string,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as string },
    );
  });

  beforeEach(async () => {
    await cleanTestDatabase(testPool);
  });

  afterAll(async () => {
    await cleanTestDatabase(testPool);
  });

  // Helper to create a todo via API
  const createTodoViaApi = async (accessToken: string, todoData: any) => {
    return await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(todoData);
  };

  // Helper to create a todo directly in DB
  const createTodoInDb = async (userId: string, todoData: any) => {
    const result = await testPool.query(
      `
      INSERT INTO todos (user_id, title, description, start_date, due_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [userId, todoData.title, todoData.description, todoData.start_date, todoData.due_date],
    );
    return result.rows[0];
  };

  describe('Authentication requirement', () => {
    test('should return 401 without authorization header', async () => {
      const response = await request(app).get('/api/v1/todos').expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_TOKEN_MISSING');
    });

    test('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/todos')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should return 401 with expired token', async () => {
      const expiredToken = jwt.sign(
        { sub: user1.id, email: user1.email },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '-1h' },
      );

      const response = await request(app)
        .get('/api/v1/todos')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_TOKEN_EXPIRED');
    });
  });

  describe('POST /api/v1/todos (Create Todo)', () => {
    test('should create todo successfully (201)', async () => {
      const response = await createTodoViaApi(user1AccessToken, validTodoData);
      expect(response.status).toBe(201);

      expect(response.body.success).toBe(true);
      expect(response.body.todo).toBeDefined();
      expect(response.body.todo.id).toBeDefined();
      expect(response.body.todo.title).toBe(validTodoData.title);
      expect(response.body.todo.description).toBe(validTodoData.description);
      expect(response.body.todo.start_date).toBe(validTodoData.start_date);
      expect(response.body.todo.due_date).toBe(validTodoData.due_date);
      expect(response.body.todo.status).toBeDefined();
      expect(response.body.todo.user_id).toBe(user1.id);
    });

    test('should create todo with empty description', async () => {
      const todoData = {
        title: 'No Description',
        start_date: '2024-01-01',
        due_date: '2024-01-31',
      };

      const response = await createTodoViaApi(user1AccessToken, todoData);
      expect(response.status).toBe(201);

      expect(response.body.success).toBe(true);
      expect(response.body.todo.description).toBe('');
    });

    test('should return 400 for missing title', async () => {
      const todoData = {
        description: 'No title',
        start_date: '2024-01-01',
        due_date: '2024-01-31',
      };

      const response = await createTodoViaApi(user1AccessToken, todoData);
      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 400 for invalid date format', async () => {
      const todoData = {
        title: 'Invalid Date',
        start_date: '01-01-2024',
        due_date: '2024-01-31',
      };

      const response = await createTodoViaApi(user1AccessToken, todoData);
      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 400 when due_date < start_date', async () => {
      const todoData = {
        title: 'Invalid Dates',
        start_date: '2024-01-31',
        due_date: '2024-01-01',
      };

      const response = await createTodoViaApi(user1AccessToken, todoData);
      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 400 for title exceeding 100 characters', async () => {
      const todoData = {
        title: 'a'.repeat(101),
        start_date: '2024-01-01',
        due_date: '2024-01-31',
      };

      const response = await createTodoViaApi(user1AccessToken, todoData);
      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 400 for description exceeding 1000 characters', async () => {
      const todoData = {
        title: 'Long Description',
        description: 'a'.repeat(1001),
        start_date: '2024-01-01',
        due_date: '2024-01-31',
      };

      const response = await createTodoViaApi(user1AccessToken, todoData);
      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/todos (Get Todos List)', () => {
    test('should return todos list (200)', async () => {
      await createTodoInDb(user1.id, validTodoData);
      await createTodoInDb(user1.id, { ...validTodoData, title: 'Todo 2' });

      const response = await request(app)
        .get('/api/v1/todos')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.todos).toBeDefined();
      expect(response.body.todos.length).toBe(2);
      expect(response.body.total).toBe(2);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(20);
    });

    test('should return empty array when user has no todos', async () => {
      const response = await request(app)
        .get('/api/v1/todos')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.todos).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    test('should only return authenticated user todos', async () => {
      await createTodoInDb(user1.id, { ...validTodoData, title: 'User 1 Todo' });
      await createTodoInDb(user2.id, { ...validTodoData, title: 'User 2 Todo' });

      const response = await request(app)
        .get('/api/v1/todos')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);

      expect(response.body.todos).toHaveLength(1);
      expect(response.body.todos[0].title).toBe('User 1 Todo');
    });

    test('should support pagination', async () => {
      for (let i = 1; i <= 25; i++) {
        await createTodoInDb(user1.id, {
          ...validTodoData,
          title: `Todo ${i}`,
          start_date: `2024-01-${String(i % 31 + 1).padStart(2, '0')}`,
        });
      }

      const response = await request(app)
        .get('/api/v1/todos?page=1&limit=10')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);

      expect(response.body.todos).toHaveLength(10);
      expect(response.body.total).toBe(25);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
    });

    test('should support sorting by start_date ascending', async () => {
      await createTodoInDb(user1.id, {
        ...validTodoData,
        title: 'Third',
        start_date: '2024-01-20',
      });
      await createTodoInDb(user1.id, {
        ...validTodoData,
        title: 'First',
        start_date: '2024-01-01',
      });
      await createTodoInDb(user1.id, {
        ...validTodoData,
        title: 'Second',
        start_date: '2024-01-10',
      });

      const response = await request(app)
        .get('/api/v1/todos?sort_by=start_date&sort_order=asc')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);

      expect(response.body.todos[0].title).toBe('First');
      expect(response.body.todos[1].title).toBe('Second');
      expect(response.body.todos[2].title).toBe('Third');
    });

    test('should support sorting by due_date descending', async () => {
      await createTodoInDb(user1.id, {
        ...validTodoData,
        title: 'First',
        due_date: '2024-01-10',
      });
      await createTodoInDb(user1.id, {
        ...validTodoData,
        title: 'Second',
        due_date: '2024-01-20',
      });
      await createTodoInDb(user1.id, {
        ...validTodoData,
        title: 'Third',
        due_date: '2024-01-30',
      });

      const response = await request(app)
        .get('/api/v1/todos?sort_by=due_date&sort_order=desc')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);

      expect(response.body.todos[0].title).toBe('Third');
      expect(response.body.todos[1].title).toBe('Second');
      expect(response.body.todos[2].title).toBe('First');
    });

    test('should filter by status', async () => {
      // Create todos with different statuses based on dates
      // Using fixed dates that will produce specific statuses
      const now = new Date();
      const pastDate = new Date(now.getTime() - 86400000 * 10).toISOString().split('T')[0]; // 10 days ago
      const futureDate = new Date(now.getTime() + 86400000 * 10).toISOString().split('T')[0]; // 10 days from now
      const today = now.toISOString().split('T')[0];

      // NOT_STARTED: future start date
      await createTodoInDb(user1.id, {
        ...validTodoData,
        title: 'Not Started',
        start_date: futureDate,
        due_date: new Date(now.getTime() + 86400000 * 20).toISOString().split('T')[0],
      });

      // IN_PROGRESS: start <= today <= due
      await createTodoInDb(user1.id, {
        ...validTodoData,
        title: 'In Progress',
        start_date: pastDate,
        due_date: futureDate,
      });

      // OVERDUE: past due date
      await createTodoInDb(user1.id, {
        ...validTodoData,
        title: 'Overdue',
        start_date: pastDate,
        due_date: pastDate,
      });

      const response = await request(app)
        .get('/api/v1/todos?status=IN_PROGRESS')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);

      expect(response.body.todos.every((t: any) => t.status === 'IN_PROGRESS')).toBe(true);
    });
  });

  describe('GET /api/v1/todos/:id (Get Todo by ID)', () => {
    test('should return todo by ID (200)', async () => {
      const todo = await createTodoInDb(user1.id, validTodoData);

      const response = await request(app)
        .get(`/api/v1/todos/${todo.id}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.todo.id).toBe(todo.id);
      expect(response.body.todo.title).toBe(validTodoData.title);
      expect(response.body.todo.status).toBeDefined();
    });

    test('should return 404 for non-existent todo', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/v1/todos/${fakeId}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    test('should return 403 for accessing another user todo', async () => {
      const otherUserTodo = await createTodoInDb(user2.id, validTodoData);

      const response = await request(app)
        .get(`/api/v1/todos/${otherUserTodo.id}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_FORBIDDEN');
    });

    test('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/v1/todos/invalid-id')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/todos/:id (Update Todo)', () => {
    test('should update todo successfully (200)', async () => {
      const todo = await createTodoInDb(user1.id, validTodoData);

      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const response = await request(app)
        .patch(`/api/v1/todos/${todo.id}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.todo.title).toBe('Updated Title');
      expect(response.body.todo.description).toBe('Updated description');
    });

    test('should update single field', async () => {
      const todo = await createTodoInDb(user1.id, validTodoData);

      const response = await request(app)
        .patch(`/api/v1/todos/${todo.id}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ title: 'Only Title Updated' })
        .expect(200);

      expect(response.body.todo.title).toBe('Only Title Updated');
    });

    test('should update dates', async () => {
      const todo = await createTodoInDb(user1.id, validTodoData);

      const updateData = {
        start_date: '2024-02-01',
        due_date: '2024-02-28',
      };

      const response = await request(app)
        .patch(`/api/v1/todos/${todo.id}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.todo.start_date).toBe('2024-02-01');
      expect(response.body.todo.due_date).toBe('2024-02-28');
    });

    test('should return 400 for invalid date relationship', async () => {
      const todo = await createTodoInDb(user1.id, validTodoData);

      const updateData = {
        start_date: '2024-01-31',
        due_date: '2024-01-01',
      };

      const response = await request(app)
        .patch(`/api/v1/todos/${todo.id}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 404 for non-existent todo', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .patch(`/api/v1/todos/${fakeId}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should return 403 for updating another user todo', async () => {
      const otherUserTodo = await createTodoInDb(user2.id, validTodoData);

      const response = await request(app)
        .patch(`/api/v1/todos/${otherUserTodo.id}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ title: 'Updated' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should return error for empty update body', async () => {
      const todo = await createTodoInDb(user1.id, validTodoData);

      const response = await request(app)
        .patch(`/api/v1/todos/${todo.id}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/todos/:id/complete (Complete Todo)', () => {
    test('should complete todo with is_success=true (200)', async () => {
      const todo = await createTodoInDb(user1.id, validTodoData);

      const response = await request(app)
        .post(`/api/v1/todos/${todo.id}/complete`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ is_success: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.todo.is_completed).toBe(true);
      expect(response.body.todo.is_success).toBe(true);
      expect(response.body.todo.status).toBe('COMPLETED_SUCCESS');
    });

    test('should complete todo with is_success=false (200)', async () => {
      const todo = await createTodoInDb(user1.id, validTodoData);

      const response = await request(app)
        .post(`/api/v1/todos/${todo.id}/complete`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ is_success: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.todo.is_completed).toBe(true);
      expect(response.body.todo.is_success).toBe(false);
      expect(response.body.todo.status).toBe('COMPLETED_FAILURE');
    });

    test('should return 404 for non-existent todo', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .post(`/api/v1/todos/${fakeId}/complete`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ is_success: true })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should return 403 for completing another user todo', async () => {
      const otherUserTodo = await createTodoInDb(user2.id, validTodoData);

      const response = await request(app)
        .post(`/api/v1/todos/${otherUserTodo.id}/complete`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ is_success: true })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should return 409 for already completed todo', async () => {
      const todo = await createTodoInDb(user1.id, {
        ...validTodoData,
        is_completed: true,
        is_success: true,
      });

      const response = await request(app)
        .post(`/api/v1/todos/${todo.id}/complete`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ is_success: true })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RESOURCE_CONFLICT');
    });

    test('should return 400 for missing is_success', async () => {
      const todo = await createTodoInDb(user1.id, validTodoData);

      const response = await request(app)
        .post(`/api/v1/todos/${todo.id}/complete`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 400 for non-boolean is_success', async () => {
      const todo = await createTodoInDb(user1.id, validTodoData);

      const response = await request(app)
        .post(`/api/v1/todos/${todo.id}/complete`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ is_success: 'true' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/todos/:id (Delete Todo)', () => {
    test('should delete todo successfully (204)', async () => {
      const todo = await createTodoInDb(user1.id, validTodoData);

      await request(app)
        .delete(`/api/v1/todos/${todo.id}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(204);

      // Verify todo is deleted
      const result = await testPool.query('SELECT * FROM todos WHERE id = $1', [todo.id]);
      expect(result.rows).toHaveLength(0);
    });

    test('should return 404 for non-existent todo', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .delete(`/api/v1/todos/${fakeId}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should return 403 for deleting another user todo', async () => {
      const otherUserTodo = await createTodoInDb(user2.id, validTodoData);

      const response = await request(app)
        .delete(`/api/v1/todos/${otherUserTodo.id}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .delete('/api/v1/todos/invalid-id')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Full CRUD flow', () => {
    test('should complete create -> read -> update -> complete -> delete flow', async () => {
      // 1. Create
      const createResponse = await createTodoViaApi(user1AccessToken, validTodoData);
      expect(createResponse.status).toBe(201);
      const todoId = createResponse.body.todo.id;

      // 2. Read
      const readResponse = await request(app)
        .get(`/api/v1/todos/${todoId}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);

      expect(readResponse.body.todo.id).toBe(todoId);

      // 3. Update
      const updateResponse = await request(app)
        .patch(`/api/v1/todos/${todoId}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(updateResponse.body.todo.title).toBe('Updated Title');

      // 4. Complete
      const completeResponse = await request(app)
        .post(`/api/v1/todos/${todoId}/complete`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ is_success: true })
        .expect(200);

      expect(completeResponse.body.todo.is_completed).toBe(true);
      expect(completeResponse.body.todo.status).toBe('COMPLETED_SUCCESS');

      // 5. Delete
      await request(app)
        .delete(`/api/v1/todos/${todoId}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(204);

      // Verify deletion
      const result = await testPool.query('SELECT * FROM todos WHERE id = $1', [todoId]);
      expect(result.rows).toHaveLength(0);
    });
  });

  describe('Ownership tests', () => {
    test('user2 cannot access user1 todos', async () => {
      const user1Todo = await createTodoInDb(user1.id, validTodoData);

      // GET
      await request(app)
        .get(`/api/v1/todos/${user1Todo.id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(403);

      // PATCH
      await request(app)
        .patch(`/api/v1/todos/${user1Todo.id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send({ title: 'Hacked!' })
        .expect(403);

      // POST complete
      await request(app)
        .post(`/api/v1/todos/${user1Todo.id}/complete`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send({ is_success: true })
        .expect(403);

      // DELETE
      await request(app)
        .delete(`/api/v1/todos/${user1Todo.id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(403);
    });

    test('user1 cannot see user2 todos in list', async () => {
      await createTodoInDb(user2.id, { ...validTodoData, title: 'User 2 Secret Todo' });

      const response = await request(app)
        .get('/api/v1/todos')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);

      expect(response.body.todos).toHaveLength(0);
    });
  });
});
