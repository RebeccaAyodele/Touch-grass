import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

export const authRouter = Router();

authRouter.post('/register', authLimiter, AuthController.register);
authRouter.post('/login', authLimiter, AuthController.login);
authRouter.post('/logout', requireAuth, AuthController.logout);
authRouter.get('/me', requireAuth, AuthController.getMe);
