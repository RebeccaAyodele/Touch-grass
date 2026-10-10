import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { UserRepository, CompletionRepository } from '@touch-grass/db';
import { UserUpdateProfileSchema } from '@touch-grass/shared';

export class UserController {
  static async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const completedCount = await CompletionRepository.countCompletedByUser(user.id);

    res.status(200).json({
      user,
      stats: {
        completedCount,
      },
    });
  }

  static async updateMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updates = UserUpdateProfileSchema.parse(req.body);
      const user = req.user!;

      const userDoc = await UserRepository.findById(user.id);
      if (!userDoc) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      if (updates.username) userDoc.username = updates.username;
      if (updates.preferences) userDoc.preferences = { ...userDoc.preferences, ...updates.preferences };
      userDoc.updatedAt = new Date();

      const updated = await UserRepository.findByIdResponse(user.id);
      res.status(200).json({ user: updated });
    } catch (err) {
      next(err);
    }
  }

  static async getPublicProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const touchGrassId = req.params.touchGrassId as string;
    if (!touchGrassId) {
      res.status(400).json({ error: 'TouchGrassId is required' });
      return;
    }

    const user = await UserRepository.findByTouchGrassIdResponse(touchGrassId);
    if (!user) {
      res.status(404).json({ error: 'Player not found.' });
      return;
    }

    const completedCount = await CompletionRepository.countCompletedByUser(user.id);

    res.status(200).json({
      touchGrassId: user.touchGrassId,
      username: user.username,
      level: user.level,
      totalXp: user.totalXp,
      streak: user.streak,
      completedCount,
      createdAt: user.createdAt,
    });
  }

  static async getMyHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const history = await CompletionRepository.findRecentByUser(user.id, 20);

    res.status(200).json({ history });
  }
}
