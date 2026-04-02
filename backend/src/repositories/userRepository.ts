import { Pool } from 'pg';
import { DatabaseError } from '../errors/AppError';

/**
 * User entity type matching the database schema
 */
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  created_at: Date;
}

/**
 * User data for insertion (without id and created_at)
 */
export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
}

/**
 * User repository for database operations on users table
 */
export class UserRepository {
  constructor(private pool: Pool) {}

  /**
   * Insert a new user into the database
   *
   * @param userData - User data to insert
   * @returns The created user with generated id
   * @throws DatabaseError if insertion fails
   */
  async insertUser(userData: CreateUserDTO): Promise<User> {
    const query = `
      INSERT INTO users (email, password, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, password, name, created_at
    `;

    try {
      const result = await this.pool.query<User>(query, [
        userData.email,
        userData.password,
        userData.name,
      ]);

      return result.rows[0];
    } catch (error) {
      // Check for unique constraint violation (duplicate email)
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        // This will be handled at service layer
        throw error;
      }

      throw new DatabaseError('Failed to create user');
    }
  }

  /**
   * Find a user by email address
   *
   * @param email - Email address to search for
   * @returns User if found, undefined otherwise
   * @throws DatabaseError if query fails
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const query = `
      SELECT id, email, password, name, created_at
      FROM users
      WHERE email = $1
    `;

    try {
      const result = await this.pool.query<User>(query, [email]);
      return result.rows[0] || undefined;
    } catch (error) {
      throw new DatabaseError('Failed to find user by email');
    }
  }

  /**
   * Find a user by ID
   *
   * @param id - User ID to search for
   * @returns User if found, undefined otherwise
   * @throws DatabaseError if query fails
   */
  async findById(id: string): Promise<User | undefined> {
    const query = `
      SELECT id, email, password, name, created_at
      FROM users
      WHERE id = $1
    `;

    try {
      const result = await this.pool.query<User>(query, [id]);
      return result.rows[0] || undefined;
    } catch (error) {
      throw new DatabaseError('Failed to find user by ID');
    }
  }
}
