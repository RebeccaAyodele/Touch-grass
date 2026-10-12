import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { requireDatabase } from '../middleware/database.js';

export const authRouter = Router();

authRouter.post('/register', authLimiter, requireDatabase, AuthController.register);
authRouter.post('/login', authLimiter, requireDatabase, AuthController.login);
authRouter.post('/logout', requireAuth, AuthController.logout);
authRouter.get('/me', requireAuth, AuthController.getMe);
