import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { UserRepository, CompletionRepository, SpaceRepository } from '@touch-grass/db';
import { rankPlayers, LeaderboardCandidate } from '@touch-grass/game';

export class LeaderboardController {
  static async getGlobalLeaderboard(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const topUsers = await UserRepository.getTopPlayers(50);

    const candidates: LeaderboardCandidate[] = await Promise.all(
      topUsers.map(async (u) => {
        const userId = u._id.toString();
        const completedCount = await CompletionRepository.countCompletedByUser(userId);
        return {
          userId,
          touchGrassId: u.touchGrassId,
          username: u.username,
          totalXp: u.totalXp,
          level: u.level,
          completedCount,
        };
      })
    );

    const leaderboard = rankPlayers(candidates);
    res.status(200).json({ leaderboard });
  }

  static async getSpaceLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const user = req.user!;

    if (!id) {
      res.status(400).json({ error: 'Space ID is required.' });
      return;
    }

    const isMember = await SpaceRepository.isMember(id, user.id);
    if (!isMember) {
      res.status(403).json({ error: 'You are not a member of this Space.' });
      return;
    }

    const members = await SpaceRepository.getMembers(id);
    const candidates: LeaderboardCandidate[] = [];

    for (const m of members) {
      const u = await UserRepository.findById(m.userId);
      if (u) {
        const completedCount = await CompletionRepository.countCompletedByUser(m.userId);
        candidates.push({
          userId: u._id.toString(),
          touchGrassId: u.touchGrassId,
          username: u.username,
          totalXp: u.totalXp,
          level: u.level,
          completedCount,
        });
      }
    }

    const leaderboard = rankPlayers(candidates);
    res.status(200).json({ leaderboard });
  }
}
