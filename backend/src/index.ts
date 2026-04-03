import { VercelRequest, VercelResponse } from '@vercel/node';
import http from 'node:http';
import { env } from './config/env';
import { pool, testConnection } from './config/database';
import { createApp } from './app';

// Vercel 환경인지 확인 (VERCEL 환경 변수가 있으면 서버리스로 동작)
const isVercel = process.env.VERCEL === '1';

// Vercel 서버리스 핸들러
let appInitialized = false;

async function ensureInitialized(): Promise<void> {
  if (!appInitialized) {
    await testConnection();
    appInitialized = true;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  await ensureInitialized();

  const app = createApp(pool);

  // Handle the request
  app(req, res);
}

// 로컬 개발 환경에서는 기존 서버 실행
if (!isVercel) {
  async function main(): Promise<void> {
    await testConnection();

    const app = createApp(pool);
    const server = http.createServer(app);

    server.listen(env.PORT, () => {
      console.info(`[SERVER] Started on port ${env.PORT} (${env.NODE_ENV})`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      console.info(`[SERVER] ${signal} received, shutting down gracefully`);
      server.close(() => {
        void pool.end().then(() => {
          console.info('[SERVER] Database pool closed');
          process.exit(0);
        });
      });
      setTimeout(() => {
        console.error('[SERVER] Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  }

  main().catch((error: unknown) => {
    console.error('[SERVER] Fatal error during startup', error);
    process.exit(1);
  });
}
