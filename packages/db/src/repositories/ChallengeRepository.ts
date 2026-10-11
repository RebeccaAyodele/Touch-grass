import { ClientSession, ObjectId } from 'mongodb';
import { getChallengesCollection } from '../collections.js';
import { ChallengeDoc, ChallengeResponse, ChallengeStatus } from '@touch-grass/shared';

function toChallengeResponse(doc: ChallengeDoc): ChallengeResponse {
  return {
    id: doc._id.toString(),
    createdBy: doc.createdBy,
    spaceId: doc.spaceId ?? null,
    title: doc.title,
    description: doc.description,
    experienceType: doc.experienceType,
    durationMinutes: doc.durationMinutes,
    difficulty: doc.difficulty,
    storyIntro: doc.storyIntro,
    objective: doc.objective,
    instructions: doc.instructions,
    completionCriteria: doc.completionCriteria,
    verificationMethods: doc.verificationMethods,
    baseXp: doc.baseXp,
    maxBonusXp: doc.maxBonusXp,
    safetyNotes: doc.safetyNotes,
    accessibilityAlternative: doc.accessibilityAlternative,
    optionalBonusObjective: doc.optionalBonusObjective,
    source: doc.source,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    startedAt: doc.startedAt ? doc.startedAt.toISOString() : null,
    completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
    expiresAt: doc.expiresAt ? doc.expiresAt.toISOString() : null,
  };
}

export class ChallengeRepository {
  static async findById(id: string): Promise<ChallengeDoc | null> {
    if (!ObjectId.isValid(id)) return null;
    return getChallengesCollection().findOne({ _id: new ObjectId(id) });
  }

  static async findByIdResponse(id: string): Promise<ChallengeResponse | null> {
    const doc = await this.findById(id);
    return doc ? toChallengeResponse(doc) : null;
  }

  static async create(challengeData: Omit<ChallengeDoc, '_id' | 'createdAt'>): Promise<ChallengeResponse> {
    const result = await getChallengesCollection().insertOne({
      ...challengeData,
      createdAt: new Date(),
    } as any);

    return toChallengeResponse({
      _id: result.insertedId,
      ...challengeData,
      createdAt: new Date(),
    });
  }

  static async updateStatus(
    id: string,
    status: ChallengeStatus,
    timestampField?: 'startedAt' | 'completedAt',
    session?: ClientSession
  ): Promise<ChallengeResponse | null> {
    if (!ObjectId.isValid(id)) return null;

    const updateDoc: any = { $set: { status } };
    if (timestampField) {
      updateDoc.$set[timestampField] = new Date();
    }

    const result = await getChallengesCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      updateDoc,
      { returnDocument: 'after', session }
    );

    return result ? toChallengeResponse(result) : null;
  }

  static async findActiveByUser(userId: string): Promise<ChallengeResponse | null> {
    const doc = await getChallengesCollection().findOne({
      createdBy: userId,
      status: { $in: ['generated', 'active'] },
    });
    return doc ? toChallengeResponse(doc) : null;
  }

  static async findRecentByUser(userId: string, limit: number = 10): Promise<ChallengeDoc[]> {
    return getChallengesCollection()
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  static async findBySpace(spaceId: string, limit: number = 10): Promise<ChallengeResponse[]> {
    const docs = await getChallengesCollection()
      .find({ spaceId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return docs.map(toChallengeResponse);
  }
}
