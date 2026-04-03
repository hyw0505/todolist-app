import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().int().positive(),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),
  CORS_ORIGIN: z.string().url(),
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_API_MAX: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),
  DB_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  DB_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(2000),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): void {
  const nodeEnv = process.env['NODE_ENV'] ?? 'development';

  // Vercel 환경에서는 환경변수를 대시보드에서 직접 주입하므로 .env 파일 불필요
  if (process.env['VERCEL'] === '1') {
    console.log('[ENV] Vercel environment detected, skipping .env file load');
    return;
  }

  const envFile = nodeEnv === 'test' ? '.env.test' : '.env.development';
  const envPath = path.resolve(process.cwd(), envFile);
  console.log(`[ENV] Loading environment file: ${envPath}`);
  // override: true to override existing environment variables
  const result = dotenv.config({ path: envPath, override: true });
  if (result.error) {
    console.error(`[ENV] Failed to load ${envFile}:`, result.error);
  } else {
    console.log(`[ENV] Successfully loaded ${envFile}`);
  }
}

function validateEnv(): Env {
  loadEnv();
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('[ENV] 환경변수 검증 실패:');
    console.error(result.error.format());
    process.exit(1);
  }
  return result.data;
}

export const env: Env = validateEnv();
