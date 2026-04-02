import http from 'node:http';
import { env } from './config/env';
import { pool, testConnection } from './config/database';
import { createApp } from './app';

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
