import { Router } from 'express';
import { Pool } from 'pg';
import { AuthController } from '../controllers/authController';
import { validateBody } from '../middlewares/validateBody';
import { signupSchema, loginSchema } from '../validators/authValidator';
import { loginRateLimiter, apiRateLimiter } from '../middlewares/rateLimiter';

/**
 * Create auth routes with rate limiting and validation
 *
 * Routes:
 * - POST /signup - Register new user
 * - POST /login - Login user
 * - POST /refresh - Refresh access token
 * - POST /logout - Logout user
 */
export function createAuthRoutes(pool: Pool): Router {
  const router = Router();
  const authController = new AuthController(pool);

  // Signup route
  router.post('/signup', apiRateLimiter, validateBody(signupSchema), authController.signup);

  // Login route
  router.post('/login', loginRateLimiter, validateBody(loginSchema), authController.login);

  // Refresh token route
  router.post('/refresh', authController.refreshToken);

  // Logout route
  router.post('/logout', authController.logout);

  return router;
}
