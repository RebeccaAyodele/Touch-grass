import { ClientSession } from 'mongodb';
import { getCompletionsCollection } from '../collections.js';
import { CompletionDoc, CompletionResponse } from '@touch-grass/shared';

function toCompletionResponse(
  doc: CompletionDoc,
  userStats: { newTotalXp: number; newLevel: number; newStreak: number; leveledUp: boolean }
): CompletionResponse {
  return {
    id: doc._id.toString(),
    challengeId: doc.challengeId,
    userId: doc.userId,
    spaceId: doc.spaceId ?? null,
    valid: doc.valid,
    baseXp: doc.baseXp,
    bonusXp: doc.bonusXp,
    finalXp: doc.finalXp,
    newTotalXp: userStats.newTotalXp,
    newLevel: userStats.newLevel,
    newStreak: userStats.newStreak,
    leveledUp: userStats.leveledUp,
    feedback: doc.feedback,
    evaluation: doc.evaluation,
    completedAt: doc.completedAt.toISOString(),
  };
}

export class CompletionRepository {
  static async findByChallengeAndUser(
    challengeId: string,
    userId: string,
    session?: ClientSession
  ): Promise<CompletionDoc | null> {
    return getCompletionsCollection().findOne({ challengeId, userId }, { session });
  }

  static async create(
    completionData: Omit<CompletionDoc, '_id' | 'completedAt'>,
    userStats: { newTotalXp: number; newLevel: number; newStreak: number; leveledUp: boolean },
    session?: ClientSession
  ): Promise<CompletionResponse> {
    const docToInsert = {
      ...completionData,
      completedAt: new Date(),
    };

    const result = await getCompletionsCollection().insertOne(docToInsert as any, { session });

    return toCompletionResponse(
      {
        _id: result.insertedId,
        ...docToInsert,
      },
      userStats
    );
  }

  static async countCompletedByUser(userId: string): Promise<number> {
    return getCompletionsCollection().countDocuments({ userId, valid: true });
  }

  static async findCompletionDatesByUser(
    userId: string,
    session?: ClientSession
  ): Promise<Date[]> {
    const completions = await getCompletionsCollection()
      .find({ userId, valid: true }, { projection: { completedAt: 1 }, session })
      .sort({ completedAt: -1 })
      .toArray();

    return completions.map((completion) => completion.completedAt);
  }

  static async findRecentByUser(userId: string, limit: number = 20): Promise<CompletionDoc[]> {
    return getCompletionsCollection()
      .find({ userId })
      .sort({ completedAt: -1 })
      .limit(limit)
      .toArray();
  }

  static async findRecentBySpace(spaceId: string, limit: number = 20): Promise<CompletionDoc[]> {
    return getCompletionsCollection()
      .find({ spaceId })
      .sort({ completedAt: -1 })
      .limit(limit)
      .toArray();
  }
}
