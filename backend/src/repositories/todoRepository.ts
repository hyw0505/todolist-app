import { Pool } from 'pg';
import { DatabaseError } from '../errors/AppError';

/**
 * Todo entity type matching the database schema
 */
export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  start_date: string;
  due_date: string;
  is_completed: boolean;
  is_success: boolean | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Todo data for insertion (without id, timestamps)
 */
export interface CreateTodoDTO {
  user_id: string;
  title: string;
  description: string;
  start_date: string;
  due_date: string;
}

/**
 * Todo data for update (all fields optional)
 */
export interface UpdateTodoDTO {
  title?: string;
  description?: string;
  start_date?: string;
  due_date?: string;
}

/**
 * Query options for getting todos list
 */
export interface GetTodosOptions {
  user_id: string;
  status?: string;
  sort_by?: 'start_date' | 'due_date';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Todo repository for database operations on todos table
 */
export class TodoRepository {
  constructor(private pool: Pool) {}

  /**
   * Insert a new todo into the database
   *
   * @param todoData - Todo data to insert
   * @returns The created todo with generated id
   * @throws DatabaseError if insertion fails
   */
  async insertTodo(todoData: CreateTodoDTO): Promise<Todo> {
    const query = `
      INSERT INTO todos (user_id, title, description, start_date, due_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    try {
      const result = await this.pool.query<Todo>(query, [
        todoData.user_id,
        todoData.title,
        todoData.description,
        todoData.start_date,
        todoData.due_date,
      ]);

      return result.rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to create todo');
    }
  }

  /**
   * Find a todo by ID
   *
   * @param id - Todo ID to search for
   * @returns Todo if found, undefined otherwise
   * @throws DatabaseError if query fails
   */
  async findById(id: string): Promise<Todo | undefined> {
    const query = `
      SELECT *
      FROM todos
      WHERE id = $1
    `;

    try {
      const result = await this.pool.query<Todo>(query, [id]);
      return result.rows[0] || undefined;
    } catch (error) {
      throw new DatabaseError('Failed to find todo by ID');
    }
  }

  /**
   * Find todos by user ID with optional filtering, sorting, and pagination
   *
   * @param options - Query options
   * @returns Array of todos and total count
   * @throws DatabaseError if query fails
   */
  async findByUserId(options: GetTodosOptions): Promise<{ todos: Todo[]; total: number }> {
    const { user_id, sort_by = 'start_date', sort_order = 'asc', page = 1, limit = 20 } = options;

    const offset = (page - 1) * limit;

    // Base query for counting
    const countQuery = `
      SELECT COUNT(*)::int as count
      FROM todos
      WHERE user_id = $1
    `;

    // Base query for fetching todos
    const baseQuery = `
      SELECT *
      FROM todos
      WHERE user_id = $1
    `;

    try {
      // Get total count
      const countResult = await this.pool.query<{ count: number }>(countQuery, [user_id]);
      const total = countResult.rows[0].count;

      // If no todos, return empty array
      if (total === 0) {
        return { todos: [], total };
      }

      // Get paginated todos with sorting
      const query = `
        ${baseQuery}
        ORDER BY ${sort_by} ${sort_order.toUpperCase()}
        LIMIT $2 OFFSET $3
      `;

      const result = await this.pool.query<Todo>(query, [user_id, limit, offset]);

      return { todos: result.rows, total };
    } catch (error) {
      throw new DatabaseError('Failed to fetch todos');
    }
  }

  /**
   * Update a todo by ID
   *
   * @param id - Todo ID to update
   * @param todoData - Todo data to update (partial)
   * @returns The updated todo
   * @throws DatabaseError if update fails
   */
  async update(id: string, todoData: UpdateTodoDTO): Promise<Todo> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    // Build dynamic SET clause
    if (todoData.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(todoData.title);
    }
    if (todoData.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(todoData.description);
    }
    if (todoData.start_date !== undefined) {
      fields.push(`start_date = $${paramIndex++}`);
      values.push(todoData.start_date);
    }
    if (todoData.due_date !== undefined) {
      fields.push(`due_date = $${paramIndex++}`);
      values.push(todoData.due_date);
    }

    // Add updated_at and id
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const idParamIndex = paramIndex;

    const query = `
      UPDATE todos
      SET ${fields.join(', ')}
      WHERE id = $${idParamIndex}
      RETURNING *
    `;

    try {
      const result = await this.pool.query<Todo>(query, values);
      return result.rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to update todo');
    }
  }

  /**
   * Mark a todo as completed
   *
   * @param id - Todo ID to complete
   * @param is_success - Success status
   * @returns The updated todo
   * @throws DatabaseError if update fails
   */
  async complete(id: string, is_success: boolean): Promise<Todo> {
    const query = `
      UPDATE todos
      SET 
        is_completed = TRUE,
        is_success = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await this.pool.query<Todo>(query, [id, is_success]);
      return result.rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to complete todo');
    }
  }

  /**
   * Delete a todo by ID
   *
   * @param id - Todo ID to delete
   * @returns true if deleted, false if not found
   * @throws DatabaseError if delete fails
   */
  async delete(id: string): Promise<boolean> {
    const query = `
      DELETE FROM todos
      WHERE id = $1
      RETURNING id
    `;

    try {
      const result = await this.pool.query<{ id: string }>(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      throw new DatabaseError('Failed to delete todo');
    }
  }
}
