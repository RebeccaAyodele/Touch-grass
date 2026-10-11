import { ClientSession, ObjectId } from 'mongodb';
import { getUsersCollection } from '../collections.js';
import { UserDoc, UserResponse } from '@touch-grass/shared';

function toUserResponse(doc: UserDoc): UserResponse {
  return {
    id: doc._id.toString(),
    touchGrassId: doc.touchGrassId,
    username: doc.username,
    email: doc.email,
    totalXp: doc.totalXp,
    level: doc.level,
    streak: doc.streak ?? 0,
    preferences: doc.preferences,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export class UserRepository {
  static async findById(id: string, session?: ClientSession): Promise<UserDoc | null> {
    if (!ObjectId.isValid(id)) return null;
    return getUsersCollection().findOne({ _id: new ObjectId(id) }, { session });
  }

  static async findByUsername(username: string): Promise<UserDoc | null> {
    return getUsersCollection().findOne(
      { username },
      { collation: { locale: 'en', strength: 2 } }
    );
  }

  static async findByIdResponse(id: string): Promise<UserResponse | null> {
    const doc = await this.findById(id);
    return doc ? toUserResponse(doc) : null;
  }

  static async findByEmail(email: string): Promise<UserDoc | null> {
    return getUsersCollection().findOne({ email: email.toLowerCase() });
  }

  static async findByTouchGrassId(touchGrassId: string): Promise<UserDoc | null> {
    return getUsersCollection().findOne({ touchGrassId });
  }

  static async findByTouchGrassIdResponse(touchGrassId: string): Promise<UserResponse | null> {
    const doc = await this.findByTouchGrassId(touchGrassId);
    return doc ? toUserResponse(doc) : null;
  }

  static async create(userData: Omit<UserDoc, '_id'>): Promise<UserResponse> {
    const result = await getUsersCollection().insertOne({
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return toUserResponse({
      _id: result.insertedId,
      ...userData,
    });
  }

  static async updateXpAndLevel(
    id: string,
    additionalXp: number,
    newLevel: number,
    session?: ClientSession
  ): Promise<UserResponse | null> {
    if (!ObjectId.isValid(id)) return null;

    const result = await getUsersCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $inc: { totalXp: additionalXp },
        $set: { level: newLevel, updatedAt: new Date() },
      },
      { returnDocument: 'after', session }
    );

    return result ? toUserResponse(result) : null;
  }

  static async getTopPlayers(limit: number = 20): Promise<UserDoc[]> {
    return getUsersCollection()
      .find({})
      .sort({ totalXp: -1 })
      .limit(limit)
      .toArray();
  }
}
