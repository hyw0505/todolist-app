import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Application, Request, Response } from 'express';
import { Pool } from 'pg';
import swaggerUi from 'swagger-ui-express';
import * as path from 'node:path';
import { createAuthRoutes } from '../src/routes/authRoutes';
import { createTodoRoutes } from '../src/routes/todoRoutes';
import { errorHandler, notFoundHandler } from '../src/middlewares/errorHandler';
import { requestLogger } from '../src/middlewares/requestLogger';

// CORS_ORIGIN 환경 변수 기본값 설정
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// 데이터베이스 풀 생성 (서버리스 환경에서 매 요청 시 재사용)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '2000'),
});

// Express 앱 생성
function createApp(): Application {
  const app = express();

  // CORS 설정
  app.use(
    cors({
      origin: CORS_ORIGIN,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());
  app.use(requestLogger);

  // Swagger UI
  const swaggerPath = path.join(__dirname, '../../swagger/swagger.json');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const swaggerDocument = require(swaggerPath);
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      swaggerOptions: {
        url: '/swagger/swagger.json',
      },
    }),
  );

  app.get('/swagger/swagger.json', (_req: Request, res: Response) => {
    res.json(swaggerDocument);
  });

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API 라우트
  app.use('/api/v1/auth', createAuthRoutes(pool));
  app.use('/api/v1/todos', createTodoRoutes(pool));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const app = createApp();

// Vercel 서버리스 핸들러
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  app(req, res);
}
