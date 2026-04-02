import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Application, Request, Response } from 'express';
import { Pool } from 'pg';
import swaggerUi from 'swagger-ui-express';
import * as path from 'node:path';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { createAuthRoutes } from './routes/authRoutes';
import { createTodoRoutes } from './routes/todoRoutes';

/**
 * Create and configure the Express application
 *
 * @param pool - PostgreSQL connection pool
 * @returns Configured Express application
 */
function createApp(pool: Pool): Application {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  // Parse JSON bodies
  app.use(express.json());

  // Parse cookies (for refresh token)
  app.use(cookieParser());

  // Request logging middleware (BE-08)
  app.use(requestLogger);

  // Serve static files from public folder
  app.use(express.static(path.join(__dirname, '../public')));

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

  // Serve swagger.json for dynamic loading
  app.get('/swagger/swagger.json', (_req: Request, res: Response) => {
    res.json(swaggerDocument);
  });

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  // Auth routes (public, no authentication required)
  app.use('/api/v1/auth', createAuthRoutes(pool));

  // Todo routes (protected, authentication required)
  app.use('/api/v1/todos', createTodoRoutes(pool));

  // 404 handler for unmatched routes
  app.use(notFoundHandler);

  // Global error handler middleware (BE-07)
  app.use(errorHandler);

  return app;
}

export { createApp };
