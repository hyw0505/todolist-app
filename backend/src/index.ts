import { VercelRequest, VercelResponse } from '@vercel/node';
import { pool, testConnection } from './config/database';
import { createApp } from './app';

// Initialize database connection on first load
let appInitialized = false;

async function ensureInitialized(): Promise<void> {
  if (!appInitialized) {
    await testConnection();
    appInitialized = true;
  }
}

// Vercel serverless handler
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  await ensureInitialized();

  const app = createApp(pool);

  // Handle the request
  app(req, res);
}
