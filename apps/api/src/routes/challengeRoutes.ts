import { Router } from 'express';
import { ChallengeController } from '../controllers/challengeController.js';
import { requireAuth } from '../middleware/auth.js';
import { aiGenerationLimiter } from '../middleware/rateLimiter.js';

export const challengeRouter = Router();

challengeRouter.use(requireAuth);

challengeRouter.post('/generate', aiGenerationLimiter, ChallengeController.generate);
challengeRouter.get('/active', ChallengeController.getActive);
challengeRouter.get('/:id', ChallengeController.getById);
challengeRouter.post('/:id/start', ChallengeController.start);
challengeRouter.post('/:id/complete', ChallengeController.complete);
