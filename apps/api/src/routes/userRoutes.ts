import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get('/me', UserController.getMyProfile);
userRouter.patch('/me', UserController.updateMyProfile);
userRouter.get('/me/history', UserController.getMyHistory);
userRouter.get('/:touchGrassId', UserController.getPublicProfile);
