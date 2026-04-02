import { Pool } from 'pg';
import { env } from '../src/config/env';

/**
 * Test database pool configuration
 */
export function createTestPool(): Pool {
  return new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    max: env.DB_POOL_MAX,
    idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
  });
}

/**
 * Clean up test data from tables
 * Order matters due to foreign key constraints
 * @param pool - Database pool
 * @param includeUsers - If true, also delete from users table (default: false)
 */
export async function cleanTestDatabase(pool: Pool, includeUsers: boolean = false): Promise<void> {
  // Delete from todos first (has foreign key to users)
  await pool.query('DELETE FROM todos');
  // Then delete from users if requested
  if (includeUsers) {
    await pool.query('DELETE FROM users');
  }
}

/**
 * Close the pool and end all clients
 */
export async function closeTestPool(pool: Pool): Promise<void> {
  await pool.end();
}

/**
 * Create a test user and return the user data
 */
export async function createTestUser(
  pool: Pool,
  overrides: Partial<{
    email: string;
    password: string;
    name: string;
  }> = {},
): Promise<{ id: string; email: string; password: string; name: string }> {
  const email = overrides.email || `test_${Date.now()}@example.com`;
  const password = overrides.password || 'TestPassword123!';
  const name = overrides.name || 'Test User';

  const result = await pool.query(
    `
    INSERT INTO users (email, password, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, password, name
  `,
    [email, password, name],
  );

  return result.rows[0];
}

/**
 * Create a test todo and return the todo data
 */
export async function createTestTodo(
  pool: Pool,
  userId: string,
  overrides: Partial<{
    title: string;
    description: string;
    start_date: string;
    due_date: string;
    is_completed: boolean;
    is_success: boolean | null;
  }> = {},
): Promise<{
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
}> {
  const title = overrides.title || 'Test Todo';
  const description = overrides.description ?? 'Test description';
  const start_date = overrides.start_date || '2024-01-01';
  const due_date = overrides.due_date || '2024-01-31';
  const is_completed = overrides.is_completed ?? false;
  const is_success = overrides.is_success ?? null;

  const result = await pool.query(
    `
    INSERT INTO todos (user_id, title, description, start_date, due_date, is_completed, is_success)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,
    [userId, title, description, start_date, due_date, is_completed, is_success],
  );

  return result.rows[0];
}
