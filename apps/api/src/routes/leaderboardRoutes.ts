import { Router } from 'express';
import { LeaderboardController } from '../controllers/leaderboardController.js';
import { requireAuth } from '../middleware/auth.js';

export const leaderboardRouter = Router();

leaderboardRouter.use(requireAuth);

leaderboardRouter.get('/', LeaderboardController.getGlobalLeaderboard);
leaderboardRouter.get('/spaces/:id', LeaderboardController.getSpaceLeaderboard);
