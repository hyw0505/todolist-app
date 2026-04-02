import request from 'supertest';
import { Pool } from 'pg';
import { createApp } from '../../src/app';
import { pool } from '../../src/config/database';
import { cleanTestDatabase, closeTestPool, createTestUser } from '../testHelpers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';
import { loginRateLimiter, apiRateLimiter, clearRateLimitStore } from '../../src/middlewares/rateLimiter';

describe('Auth Integration Tests (BE-10, BE-11, BE-12)', () => {
  let app: any;
  let testPool: Pool;

  const validSignupData = {
    email: `test_${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    name: 'Integration Test User',
  };

  const validLoginData = {
    email: 'login-test@example.com',
    password: 'SecurePassword123!',
  };

  beforeAll(async () => {
    // Create a test pool
    testPool = pool;
    app = createApp(testPool);

    // Create a user for login tests
    const hashedPassword = await bcrypt.hash(validLoginData.password, 10);
    await testPool.query(
      `
      INSERT INTO users (email, password, name)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING
    `,
      [validLoginData.email, hashedPassword, 'Login Test User'],
    );
  });

  beforeEach(async () => {
    await cleanTestDatabase(testPool, true);
    
    // Reset rate limiting to avoid affecting other tests
    clearRateLimitStore();

    // Recreate login test user after cleanup
    const hashedPassword = await bcrypt.hash(validLoginData.password, 10);
    await testPool.query(
      `
      INSERT INTO users (email, password, name)
      VALUES ($1, $2, $3)
    `,
      [validLoginData.email, hashedPassword, 'Login Test User'],
    );
  });

  afterAll(async () => {
    await cleanTestDatabase(testPool);
  });

  describe('POST /api/v1/auth/signup', () => {
    test('should register new user successfully (201)', async () => {
      const signupData = {
        email: `newuser_${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        name: 'New User',
      };

      const response = await request(app).post('/api/v1/auth/signup').send(signupData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('회원가입 완료');
      expect(response.body.userId).toBeDefined();
      expect(response.body.userId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    test('should return 400 for invalid email format', async () => {
      const signupData = {
        email: 'invalid-email',
        password: 'SecurePassword123!',
        name: 'Test User',
      };

      const response = await request(app).post('/api/v1/auth/signup').send(signupData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    test('should return 400 for weak password', async () => {
      const signupData = {
        email: `weak_${Date.now()}@example.com`,
        password: 'weak',
        name: 'Test User',
      };

      const response = await request(app).post('/api/v1/auth/signup').send(signupData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    test('should return 400 for missing required fields', async () => {
      const signupData = {
        email: `missing_${Date.now()}@example.com`,
        // missing password and name
      };

      const response = await request(app).post('/api/v1/auth/signup').send(signupData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    test('should return 400 for empty name', async () => {
      const signupData = {
        email: `empty_${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        name: '',
      };

      const response = await request(app).post('/api/v1/auth/signup').send(signupData).expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 409 for duplicate email', async () => {
      const signupData = {
        email: validLoginData.email, // Use existing email
        password: 'SecurePassword123!',
        name: 'Duplicate User',
      };

      const response = await request(app).post('/api/v1/auth/signup').send(signupData).expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    test('should return 400 for name exceeding 50 characters', async () => {
      const signupData = {
        email: `long_${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        name: 'a'.repeat(51),
      };

      const response = await request(app).post('/api/v1/auth/signup').send(signupData).expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 400 for password exceeding 64 characters', async () => {
      const signupData = {
        email: `long_${Date.now()}@example.com`,
        password: 'a'.repeat(65),
        name: 'Test User',
      };

      const response = await request(app).post('/api/v1/auth/signup').send(signupData).expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    test('should login successfully and return tokens (200)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(validLoginData);
      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.email).toBe(validLoginData.email);
      expect(response.body.user.name).toBe('Login Test User');

      // Check refresh token cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const refreshTokenCookie = (response.headers['set-cookie'] as unknown as string[]).find((c) =>
        c.includes('refreshToken'),
      );
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toContain('HttpOnly');
    });

    test('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SecurePassword123!',
      };

      const response = await request(app).post('/api/v1/auth/login').send(loginData);
      expect(response.status).toBe(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    test('should return 401 for invalid password', async () => {
      const loginData = {
        email: validLoginData.email,
        password: 'WrongPassword123!',
      };

      const response = await request(app).post('/api/v1/auth/login').send(loginData);
      expect(response.status).toBe(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    test('should refresh access token successfully (200)', async () => {
      // First login to get refresh token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(validLoginData)
        .expect(200);

      // Extract refresh token from cookie
      const refreshTokenCookie = (loginResponse.headers['set-cookie'] as unknown as string[]).find(
        (c) => c.includes('refreshToken'),
      );
      const refreshToken = refreshTokenCookie!.match(/refreshToken=([^;]+)/)![1];

      // Refresh token
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshTokenCookie!)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();
    });

    test('should return 401 for missing refresh token', async () => {
      const response = await request(app).post('/api/v1/auth/refresh').expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    test('should return 401 for expired refresh token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { sub: 'user-id', type: 'refresh' },
        env.JWT_REFRESH_SECRET,
        { expiresIn: '-1h' }, // Expired 1 hour ago
      );

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refreshToken=${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    test('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refreshToken=invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    test('should return 401 for token with wrong type', async () => {
      // Create an access token instead of refresh token
      const accessToken = jwt.sign(
        { sub: 'user-id', email: 'test@example.com' },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '1h' },
      );

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refreshToken=${accessToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should return 401 for refresh token of deleted user', async () => {
      // Create a user and get their refresh token
      const tempUser = {
        email: `temp_${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        name: 'Temp User',
      };

      const hashedPassword = await bcrypt.hash(tempUser.password, 10);
      const result = await testPool.query(
        `
        INSERT INTO users (email, password, name)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
        [tempUser.email, hashedPassword, tempUser.name],
      );
      const userId = result.rows[0].id;

      // Create valid refresh token
      const refreshToken = jwt.sign(
        { sub: userId, type: 'refresh' },
        env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' },
      );

      // Delete the user
      await testPool.query('DELETE FROM users WHERE id = $1', [userId]);

      // Try to refresh
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    test('should logout successfully and clear cookie (200)', async () => {
      const response = await request(app).post('/api/v1/auth/logout').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('로그아웃되었습니다');

      // Check that refresh token cookie is cleared
      expect(response.headers['set-cookie']).toBeDefined();
      const clearCookie = (response.headers['set-cookie'] as unknown as string[]).find((c) =>
        c.includes('refreshToken'),
      );
      expect(clearCookie).toBeDefined();
      // Cookie is cleared with either Max-Age=0 or Expires in the past
      expect(clearCookie).toMatch(/(Max-Age=0|Expires=Thu, 01 Jan 1970)/);
    });

    test('should logout without authentication', async () => {
      // Logout should work without being authenticated
      const response = await request(app).post('/api/v1/auth/logout').expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Full auth flow', () => {
    test('should complete signup -> login -> refresh -> logout flow', async () => {
      const signupData = {
        email: `flow_${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        name: 'Flow Test User',
      };

      // 1. Signup
      const signupResponse = await request(app)
        .post('/api/v1/auth/signup')
        .send(signupData)
        .expect(201);

      expect(signupResponse.body.success).toBe(true);
      const userId = signupResponse.body.userId;

      // 2. Login
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: signupData.email,
          password: signupData.password,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.user.id).toBe(userId);
      const accessToken = loginResponse.body.accessToken;
      const refreshTokenCookie = (loginResponse.headers['set-cookie'] as unknown as string[]).find(
        (c) => c.includes('refreshToken'),
      );

      // 3. Refresh
      // Wait a bit to ensure different token
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshTokenCookie!)
        .expect(200);

      expect(refreshResponse.body.success).toBe(true);
      expect(refreshResponse.body.accessToken).toBeDefined();
      // Note: Access token may be the same if issued within the same second
      // The important thing is that it's a valid token

      // 4. Logout
      const logoutResponse = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', refreshTokenCookie!)
        .expect(200);

      expect(logoutResponse.body.success).toBe(true);
    });
  });

  // Rate limiting is tested in unit tests (rateLimiter.test.ts)
  // Integration test for rate limiting is skipped to avoid affecting other tests

  describe('CORS and security headers', () => {
    test('should include CORS headers', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .set('Origin', env.CORS_ORIGIN)
        .send({
          email: `cors_${Date.now()}@example.com`,
          password: 'SecurePassword123!',
          name: 'CORS Test',
        });

      expect(response.status).toBe(201);
      expect(response.headers['access-control-allow-origin']).toBe(env.CORS_ORIGIN);
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });
});
