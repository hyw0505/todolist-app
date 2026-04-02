import type { Pool, PoolClient } from 'pg';

// pg 모듈 모킹
jest.mock('pg');

// env 의존성 모킹
jest.mock('../../../src/config/env', () => ({
  env: {
    DB_HOST: 'localhost',
    DB_PORT: 5432,
    DB_NAME: 'todolist_test',
    DB_USER: 'test-user',
    DB_PASSWORD: 'test-password',
    DB_POOL_MAX: 5,
    DB_POOL_IDLE_TIMEOUT_MS: 30000,
    DB_CONNECTION_TIMEOUT_MS: 2000,
  },
}));

describe('database config', () => {
  let mockPoolInstance: {
    on: jest.Mock;
    connect: jest.Mock;
    end: jest.Mock;
  };
  let MockPool: jest.Mock;

  beforeEach(() => {
    jest.resetModules();

    mockPoolInstance = {
      on: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
    };

    // pg 재모킹 (resetModules 후 재설정 필요)
    jest.mock('pg');
    const pg = require('pg') as { Pool: jest.Mock };
    MockPool = pg.Pool;
    MockPool.mockImplementation(() => mockPoolInstance);
  });

  function loadDatabaseModule(): {
    pool: Pool;
    testConnection: () => Promise<void>;
  } {
    return require('../../../src/config/database') as {
      pool: Pool;
      testConnection: () => Promise<void>;
    };
  }

  test('1. Pool이 env 값으로 생성되는지', () => {
    loadDatabaseModule();
    expect(MockPool).toHaveBeenCalledWith({
      host: 'localhost',
      port: 5432,
      database: 'todolist_test',
      user: 'test-user',
      password: 'test-password',
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  });

  test("2. pool.on('error') 핸들러 등록 여부", () => {
    loadDatabaseModule();
    expect(mockPoolInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  test('3. testConnection() 성공 시 connect/query/release 순서 호출', async () => {
    const mockRelease = jest.fn();
    const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
    const mockClient: Partial<PoolClient> = {
      query: mockQuery,
      release: mockRelease,
    };
    mockPoolInstance.connect.mockResolvedValue(mockClient);

    const { testConnection } = loadDatabaseModule();
    await testConnection();

    expect(mockPoolInstance.connect).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith('SELECT 1');
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  test('4. testConnection() connect 실패 시 에러 throw', async () => {
    const connectError = new Error('Connection refused');
    mockPoolInstance.connect.mockRejectedValue(connectError);

    const { testConnection } = loadDatabaseModule();
    await expect(testConnection()).rejects.toThrow('Connection refused');
  });

  test('5. testConnection() query 실패 시 release()가 finally에서 호출되는지', async () => {
    const mockRelease = jest.fn();
    const mockQuery = jest.fn().mockRejectedValue(new Error('Query failed'));
    const mockClient: Partial<PoolClient> = {
      query: mockQuery,
      release: mockRelease,
    };
    mockPoolInstance.connect.mockResolvedValue(mockClient);

    const { testConnection } = loadDatabaseModule();
    await expect(testConnection()).rejects.toThrow('Query failed');
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });
});
