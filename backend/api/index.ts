import { VercelRequest, VercelResponse } from '@vercel/node';
import { pool, testConnection } from '../src/config/database';
import { createApp } from '../src/app';

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
