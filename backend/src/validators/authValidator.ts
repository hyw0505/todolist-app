import { z } from 'zod';

/**
 * Password validation regex:
 * - Minimum 8 characters, maximum 64 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character from: !@#$%^&*()_+-={}
 */
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}])[A-Za-z\d!@#$%^&*()_+\-={}]{8,64}$/;

/**
 * Signup validation schema
 *
 * Validates:
 * - email: valid email format
 * - password: 8-64 chars, uppercase, lowercase, number, special char
 * - name: 1-50 characters
 */
export const signupSchema = z.object({
  email: z
    .string()
    .email('유효하지 않은 이메일 주소입니다')
    .max(255, '이메일은 255 자 이하여야 합니다'),

  password: z
    .string()
    .min(8, '비밀번호는 8 자 이상이어야 합니다')
    .max(64, '비밀번호는 64 자 이하여야 합니다')
    .regex(
      PASSWORD_REGEX,
      '비밀번호는 8 자 이상, 대문자·소문자·숫자·특수문자를 각 1 자 이상 포함해야 합니다',
    ),

  name: z.string().min(1, '이름은 필수입니다').max(50, '이름은 50 자 이하여야 합니다').trim(),
});

/**
 * Login validation schema
 *
 * Validates:
 * - email: valid email format
 * - password: non-empty string
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('유효하지 않은 이메일 주소입니다')
    .max(255, '이메일은 255 자 이하여야 합니다'),

  password: z
    .string()
    .min(1, '비밀번호는 필수입니다')
    .max(64, '비밀번호는 64 자 이하여야 합니다'),
});

/**
 * Refresh token request schema
 *
 * Validates that refreshToken is present (will come from cookie)
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
