import { Router } from 'express';
import { SpaceController } from '../controllers/spaceController.js';
import { requireAuth } from '../middleware/auth.js';

export const spaceRouter = Router();

spaceRouter.use(requireAuth);

spaceRouter.post('/', SpaceController.createSpace);
spaceRouter.get('/', SpaceController.getMySpaces);
spaceRouter.post('/join', SpaceController.joinSpace);
spaceRouter.get('/:id', SpaceController.getSpaceById);
spaceRouter.post('/:id/leave', SpaceController.leaveSpace);
spaceRouter.get('/:id/challenges', SpaceController.getSpaceChallenges);
