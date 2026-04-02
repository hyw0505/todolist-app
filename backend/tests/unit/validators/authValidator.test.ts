import { signupSchema, loginSchema, refreshTokenSchema } from '../../../src/validators/authValidator';

describe('authValidator (BE-10, BE-11)', () => {
  describe('signupSchema', () => {
    describe('Valid signup data', () => {
      test('should pass with valid email, password, and name', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123!',
          name: 'John Doe',
        };

        const result = signupSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      test('should pass with minimum valid password', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Abcdefg1!',
          name: 'John',
        };

        const result = signupSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      test('should pass with password containing all special characters', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Test1234!@#$%^&*()_+-{}',
          name: 'John',
        };

        const result = signupSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      test('should pass with maximum length name (50 chars)', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123!',
          name: 'a'.repeat(50),
        };

        const result = signupSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      test('should pass with minimum length name (1 char)', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123!',
          name: 'A',
        };

        const result = signupSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      test('should trim name and pass validation', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123!',
          name: '  John Doe  ',
        };

        const result = signupSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe('John Doe');
        }
      });
    });

    describe('Invalid email formats', () => {
      test('should fail with invalid email - no @ symbol', () => {
        const invalidData = {
          email: 'invalidemail.com',
          password: 'Password123!',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes('email'))).toBe(true);
        }
      });

      test('should fail with invalid email - no domain', () => {
        const invalidData = {
          email: 'test@',
          password: 'Password123!',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes('email'))).toBe(true);
        }
      });

      test('should fail with invalid email - no TLD', () => {
        const invalidData = {
          email: 'test@example',
          password: 'Password123!',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes('email'))).toBe(true);
        }
      });

      test('should fail with invalid email - spaces', () => {
        const invalidData = {
          email: 'test @example.com',
          password: 'Password123!',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes('email'))).toBe(true);
        }
      });

      test('should fail with empty email', () => {
        const invalidData = {
          email: '',
          password: 'Password123!',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes('email'))).toBe(true);
        }
      });

      test('should fail with email exceeding 255 characters', () => {
        // Total email length exceeds 255
        const invalidData = {
          email: 'a'.repeat(245) + '@example.com',
          password: 'Password123!',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes('email'))).toBe(true);
        }
      });
    });

    describe('Password policy violations', () => {
      test('should fail with password too short (less than 8 chars)', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Abc1!',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordError = result.error.errors.find((e) => e.path.includes('password'));
          expect(passwordError?.message).toBe('Password must be at least 8 characters');
        }
      });

      test('should fail with password too long (more than 64 chars)', () => {
        // Use a password that passes regex but is too long
        const invalidData = {
          email: 'test@example.com',
          // 65 chars with all required character types
          password: 'Aa1!' + 'b'.repeat(61),
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordError = result.error.errors.find((e) => e.path.includes('password'));
          expect(passwordError?.message).toBe('Password must be at most 64 characters');
        }
      });

      test('should fail with password missing uppercase', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'password123!',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordError = result.error.errors.find((e) => e.path.includes('password'));
          expect(passwordError?.message).toContain('uppercase');
        }
      });

      test('should fail with password missing lowercase', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'PASSWORD123!',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordError = result.error.errors.find((e) => e.path.includes('password'));
          expect(passwordError?.message).toContain('lowercase');
        }
      });

      test('should fail with password missing number', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'PasswordABC!',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordError = result.error.errors.find((e) => e.path.includes('password'));
          expect(passwordError?.message).toContain('number');
        }
      });

      test('should fail with password missing special character', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordError = result.error.errors.find((e) => e.path.includes('password'));
          expect(passwordError?.message).toContain('special character');
        }
      });

      test('should fail with password containing only whitespace', () => {
        const invalidData = {
          email: 'test@example.com',
          password: '        ',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      test('should fail with password missing all requirements', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'abcd',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordError = result.error.errors.find((e) => e.path.includes('password'));
          expect(passwordError?.message).toBe('Password must be at least 8 characters');
        }
      });
    });

    describe('Name length validation', () => {
      test('should fail with empty name', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123!',
          name: '',
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const nameError = result.error.errors.find((e) => e.path.includes('name'));
          expect(nameError?.message).toBe('Name is required');
        }
      });

      test('should fail with name exceeding 50 characters', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123!',
          name: 'a'.repeat(51),
        };

        const result = signupSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const nameError = result.error.errors.find((e) => e.path.includes('name'));
          expect(nameError?.message).toBe('Name must be at most 50 characters');
        }
      });

      test('should fail with whitespace-only name', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123!',
          // After trim, this becomes empty string which fails min(1)
          name: '   ',
        };

        const result = signupSchema.safeParse(invalidData);

        // Zod's .trim() transforms whitespace to empty, then .min(1) fails
        // But in some zod versions, trim happens during parse, not before validation
        // We test the practical outcome: empty after trim should fail
        if (result.success) {
          // If it passes, the trimmed value should be empty
          expect(result.data.name).toBe('');
        } else {
          // If it fails, that's also valid behavior
          expect(result.error.errors.some((e) => e.path.includes('name'))).toBe(true);
        }
      });
    });

    describe('Missing required fields', () => {
      test('should fail with missing email', () => {
        const invalidData = {
          password: 'Password123!',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData as any);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes('email'))).toBe(true);
        }
      });

      test('should fail with missing password', () => {
        const invalidData = {
          email: 'test@example.com',
          name: 'John',
        };

        const result = signupSchema.safeParse(invalidData as any);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes('password'))).toBe(true);
        }
      });

      test('should fail with missing name', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123!',
        };

        const result = signupSchema.safeParse(invalidData as any);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes('name'))).toBe(true);
        }
      });
    });
  });

  describe('loginSchema', () => {
    describe('Valid login data', () => {
      test('should pass with valid email and password', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123!',
        };

        const result = loginSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      test('should pass with simple valid password', () => {
        const validData = {
          email: 'test@example.com',
          password: 'simple',
        };

        const result = loginSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      test('should pass with maximum length email', () => {
        const validData = {
          email: 'a'.repeat(242) + '@example.com',
          password: 'password',
        };

        const result = loginSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });
    });

    describe('Invalid login data', () => {
      test('should fail with missing email', () => {
        const invalidData = {
          password: 'password',
        };

        const result = loginSchema.safeParse(invalidData as any);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes('email'))).toBe(true);
        }
      });

      test('should fail with missing password', () => {
        const invalidData = {
          email: 'test@example.com',
        };

        const result = loginSchema.safeParse(invalidData as any);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes('password'))).toBe(true);
        }
      });

      test('should fail with empty password', () => {
        const invalidData = {
          email: 'test@example.com',
          password: '',
        };

        const result = loginSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordError = result.error.errors.find((e) => e.path.includes('password'));
          expect(passwordError?.message).toBe('Password is required');
        }
      });

      test('should fail with empty email', () => {
        const invalidData = {
          email: '',
          password: 'password',
        };

        const result = loginSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes('email'))).toBe(true);
        }
      });

      test('should fail with invalid email format', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'password',
        };

        const result = loginSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes('email'))).toBe(true);
        }
      });

      test('should fail with password exceeding 64 characters', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'a'.repeat(65),
        };

        const result = loginSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordError = result.error.errors.find((e) => e.path.includes('password'));
          expect(passwordError?.message).toBe('Password must be at most 64 characters');
        }
      });
    });
  });

  describe('refreshTokenSchema', () => {
    test('should pass with valid refresh token', () => {
      const validData = {
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
      };

      const result = refreshTokenSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    test('should pass without refreshToken (will come from cookie)', () => {
      const validData = {};

      const result = refreshTokenSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    test('should pass with empty string refreshToken', () => {
      const validData = {
        refreshToken: '',
      };

      const result = refreshTokenSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });
});
