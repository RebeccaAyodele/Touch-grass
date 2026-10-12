import { MongoServerError } from 'mongodb';
import { CompletionDoc } from '@touch-grass/shared';
import {
  ChallengeRepository,
  CompletionRepository,
  UserRepository,
  withDatabaseTransaction,
} from '@touch-grass/db';
import { calculateCurrentStreak, calculateLevel } from '@touch-grass/game';

export class CompletionAlreadyClaimedError extends Error {
  constructor() {
    super('You have already completed and claimed rewards for this challenge.');
    this.name = 'CompletionAlreadyClaimedError';
  }
}

/** Persists the reward, challenge state, and completion record all-or-nothing. */
export async function persistChallengeCompletion(
  completionData: Omit<CompletionDoc, '_id' | 'completedAt'>
) {
  return withDatabaseTransaction(async (session) => {
    const completedAt = new Date();
    const existing = await CompletionRepository.findByChallengeAndUser(
      completionData.challengeId,
      completionData.userId,
      session
    );
    if (existing) throw new CompletionAlreadyClaimedError();

    const user = await UserRepository.findById(completionData.userId, session);
    if (!user) throw new Error('User was not found while awarding challenge XP.');

    const newTotalXp = user.totalXp + completionData.finalXp;
    const newLevel = calculateLevel(newTotalXp);
    const previousCompletionDates = await CompletionRepository.findCompletionDatesByUser(
      completionData.userId,
      session
    );
    const newStreak = calculateCurrentStreak(previousCompletionDates, completedAt);
    const userUpdate = await UserRepository.updateXpAndLevel(
      completionData.userId,
      completionData.finalXp,
      newLevel,
      newStreak,
      session
    );
    if (!userUpdate) throw new Error('User could not be updated while awarding challenge XP.');

    const challengeUpdate = await ChallengeRepository.updateStatus(
      completionData.challengeId,
      'completed',
      'completedAt',
      session
    );
    if (!challengeUpdate) throw new Error('Challenge could not be updated while saving completion.');

    try {
      return await CompletionRepository.create(
        completionData,
        {
          newTotalXp,
          newLevel,
          newStreak,
          leveledUp: newLevel > user.level,
        },
        session
      );
    } catch (error) {
      // The unique (userId, challengeId) index is the final guard against a race.
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new CompletionAlreadyClaimedError();
      }
      throw error;
    }
  });
}
