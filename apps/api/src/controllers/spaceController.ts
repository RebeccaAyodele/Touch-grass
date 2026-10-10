import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { SpaceRepository, UserRepository, ChallengeRepository } from '@touch-grass/db';
import { SpaceCreateSchema, SpaceJoinSchema, SpaceMember } from '@touch-grass/shared';

export class SpaceController {
  static async createSpace(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { name, description } = SpaceCreateSchema.parse(req.body);

      const space = await SpaceRepository.create(name, description, user.id);
      res.status(201).json({ space });
    } catch (err) {
      next(err);
    }
  }

  static async getMySpaces(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const spaces = await SpaceRepository.getSpacesForUser(user.id);
    res.status(200).json({ spaces });
  }

  static async getSpaceById(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const space = await SpaceRepository.getSpaceDetails(id);
    if (!space) {
      res.status(404).json({ error: 'Space not found.' });
      return;
    }

    const rawMembers = await SpaceRepository.getMembers(id);
    const members: SpaceMember[] = [];

    for (const m of rawMembers) {
      const u = await UserRepository.findByIdResponse(m.userId);
      if (u) {
        members.push({
          userId: u.id,
          touchGrassId: u.touchGrassId,
          username: u.username,
          role: m.role,
          totalXp: u.totalXp,
          level: u.level,
          joinedAt: m.joinedAt.toISOString(),
        });
      }
    }

    res.status(200).json({
      space: {
        ...space,
        members,
      },
    });
  }

  static async joinSpace(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { inviteCode } = SpaceJoinSchema.parse(req.body);

      const spaceDoc = await SpaceRepository.findByInviteCode(inviteCode);
      if (!spaceDoc) {
        res.status(404).json({ error: 'No Space found with this invite code.' });
        return;
      }

      const spaceId = spaceDoc._id.toString();
      await SpaceRepository.addMember(spaceId, user.id, 'member');

      const space = await SpaceRepository.getSpaceDetails(spaceId);
      res.status(200).json({ space, message: 'Joined Space successfully!' });
    } catch (err) {
      next(err);
    }
  }

  static async leaveSpace(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const user = req.user!;

    if (!id) {
      res.status(400).json({ error: 'Space ID is required.' });
      return;
    }

    const removed = await SpaceRepository.removeMember(id, user.id);
    if (!removed) {
      res.status(400).json({ error: 'Could not leave Space or you were not a member.' });
      return;
    }

    res.status(200).json({ message: 'Successfully left the Space.' });
  }

  static async getSpaceChallenges(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const challenges = await ChallengeRepository.findBySpace(id, 10);
    res.status(200).json({ challenges });
  }
}
