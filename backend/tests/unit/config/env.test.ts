jest.mock('dotenv', () => ({
  config: jest.fn(),
  default: { config: jest.fn() },
}));

const VALID_ENV = {
  NODE_ENV: 'development',
  PORT: '3000',
  JWT_ACCESS_SECRET: 'dev-access-secret-must-be-32-chars-min!!',
  JWT_REFRESH_SECRET: 'dev-refresh-secret-must-be-32-chars-min!',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  CORS_ORIGIN: 'http://localhost:5173',
  RATE_LIMIT_LOGIN_MAX: '5',
  RATE_LIMIT_API_MAX: '60',
  RATE_LIMIT_WINDOW_MS: '60000',
  BCRYPT_SALT_ROUNDS: '10',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'todolist_dev',
  DB_USER: 'todolist-user',
  DB_PASSWORD: 'todolist',
  DB_POOL_MAX: '10',
  DB_POOL_IDLE_TIMEOUT_MS: '30000',
  DB_CONNECTION_TIMEOUT_MS: '2000',
};

describe('env config', () => {
  let exitSpy: jest.SpyInstance;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    jest.resetModules();
    originalEnv = { ...process.env };
    // 기존 관련 환경변수 제거
    Object.keys(VALID_ENV).forEach((key) => {
      delete process.env[key];
    });
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((code?) => {
      throw new Error(`process.exit(${code})`);
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    exitSpy.mockRestore();
  });

  function setEnv(overrides: Partial<Record<string, string>>): void {
    Object.assign(process.env, { ...VALID_ENV, ...overrides });
  }

  function loadEnvModule(): { env: unknown } {
    return require('../../../src/config/env') as { env: unknown };
  }

  test('1. 유효한 환경변수 → env 객체 반환', () => {
    setEnv({});
    const { env } = loadEnvModule();
    expect(env).toBeDefined();
    expect((env as Record<string, unknown>)['NODE_ENV']).toBe('development');
    expect((env as Record<string, unknown>)['PORT']).toBe(3000);
  });

  test('2. JWT_ACCESS_SECRET 31자 → process.exit(1)', () => {
    setEnv({ JWT_ACCESS_SECRET: 'a'.repeat(31) });
    expect(() => loadEnvModule()).toThrow('process.exit(1)');
  });

  test('3. JWT_REFRESH_SECRET 31자 → process.exit(1)', () => {
    setEnv({ JWT_REFRESH_SECRET: 'b'.repeat(31) });
    expect(() => loadEnvModule()).toThrow('process.exit(1)');
  });

  test('4. PORT 누락 → process.exit(1)', () => {
    setEnv({ PORT: undefined });
    expect(() => loadEnvModule()).toThrow('process.exit(1)');
  });

  test('5. DB_PASSWORD 누락 → process.exit(1)', () => {
    setEnv({ DB_PASSWORD: undefined });
    expect(() => loadEnvModule()).toThrow('process.exit(1)');
  });

  test("6. PORT에 'abc' → process.exit(1)", () => {
    setEnv({ PORT: 'abc' });
    expect(() => loadEnvModule()).toThrow('process.exit(1)');
  });

  test('7. CORS_ORIGIN이 유효하지 않은 URL → process.exit(1)', () => {
    setEnv({ CORS_ORIGIN: 'not-a-valid-url' });
    expect(() => loadEnvModule()).toThrow('process.exit(1)');
  });

  test('8. DB_POOL_IDLE_TIMEOUT_MS 미설정 → 기본값 30000', () => {
    setEnv({ DB_POOL_IDLE_TIMEOUT_MS: undefined });
    const { env } = loadEnvModule();
    expect((env as Record<string, unknown>)['DB_POOL_IDLE_TIMEOUT_MS']).toBe(30000);
  });

  test('9. DB_CONNECTION_TIMEOUT_MS 미설정 → 기본값 2000', () => {
    setEnv({ DB_CONNECTION_TIMEOUT_MS: undefined });
    const { env } = loadEnvModule();
    expect((env as Record<string, unknown>)['DB_CONNECTION_TIMEOUT_MS']).toBe(2000);
  });

  test("10. PORT '3000' 문자열 → coerce로 숫자 3000", () => {
    setEnv({ PORT: '3000' });
    const { env } = loadEnvModule();
    expect((env as Record<string, unknown>)['PORT']).toBe(3000);
    expect(typeof (env as Record<string, unknown>)['PORT']).toBe('number');
  });
});
