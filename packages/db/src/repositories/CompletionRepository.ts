import { ObjectId } from 'mongodb';
import { getCompletionsCollection } from '../collections.js';
import { CompletionDoc, CompletionResponse } from '@touch-grass/shared';

function toCompletionResponse(
  doc: CompletionDoc,
  userStats: { newTotalXp: number; newLevel: number; leveledUp: boolean }
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
    leveledUp: userStats.leveledUp,
    feedback: doc.feedback,
    evaluation: doc.evaluation,
    completedAt: doc.completedAt.toISOString(),
  };
}

export class CompletionRepository {
  static async findByChallengeAndUser(challengeId: string, userId: string): Promise<CompletionDoc | null> {
    return getCompletionsCollection().findOne({ challengeId, userId });
  }

  static async create(
    completionData: Omit<CompletionDoc, '_id' | 'completedAt'>,
    userStats: { newTotalXp: number; newLevel: number; leveledUp: boolean }
  ): Promise<CompletionResponse> {
    const docToInsert = {
      ...completionData,
      completedAt: new Date(),
    };

    const result = await getCompletionsCollection().insertOne(docToInsert as any);

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
