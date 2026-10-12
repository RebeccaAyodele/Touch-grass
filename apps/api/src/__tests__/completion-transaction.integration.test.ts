import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import {
  COLLECTIONS,
  connectDatabase,
  disconnectDatabase,
  ensureDatabaseIndexes,
  getDb,
  getCompletionsCollection,
  getUsersCollection,
} from '@touch-grass/db';
import { CompletionDoc, UserDoc, ChallengeDoc } from '@touch-grass/shared';
import {
  CompletionAlreadyClaimedError,
  persistChallengeCompletion,
} from '../services/completionService.js';

const testMongoUri = process.env.MONGODB_TEST_URI;
const describeWithMongo = describe.skipIf(!testMongoUri);

describeWithMongo('challenge completion transaction (MongoDB integration)', () => {
  const databaseName = `touch_grass_test_${process.pid}_${Date.now()}`;
  const userId = new ObjectId();
  const challengeId = new ObjectId();
  const xpReward = 45;
  let databaseConnected = false;

  beforeAll(async () => {
    await connectDatabase({ uri: testMongoUri!, dbName: databaseName });
    databaseConnected = true;
    await ensureDatabaseIndexes();

    const now = new Date();
    const user: UserDoc = {
      _id: userId,
      touchGrassId: `test-${userId.toString()}`,
      username: `test-${userId.toString()}`,
      email: `${userId.toString()}@example.test`,
      passwordHash: 'not-used-by-this-test',
      totalXp: 0,
      level: 1,
      streak: 0,
      createdAt: now,
      updatedAt: now,
    };
    const challenge: ChallengeDoc = {
      _id: challengeId,
      createdBy: userId.toString(),
      spaceId: null,
      experienceType: 'explore',
      title: 'Integration test challenge',
      description: 'A challenge used only by the transaction integration test.',
      durationMinutes: 10,
      difficulty: 'easy',
      objective: 'Verify one reward is recorded.',
      instructions: ['Submit the test completion.'],
      completionCriteria: 'The transaction persists the completion.',
      verificationMethods: ['honor'],
      baseXp: xpReward,
      maxBonusXp: 0,
      source: 'mock',
      status: 'active',
      createdAt: now,
      startedAt: now,
      completedAt: null,
      expiresAt: null,
    };

    await getUsersCollection().insertOne(user);
    await getDb().collection<ChallengeDoc>(COLLECTIONS.CHALLENGES).insertOne(challenge);
  }, 30_000);

  afterAll(async () => {
    try {
      if (databaseConnected) {
        await getDb().dropDatabase();
      }
    } finally {
      await disconnectDatabase();
    }
  }, 30_000);

  it('awards XP and writes one completion when the same completion is submitted concurrently', async () => {
    const completion: Omit<CompletionDoc, '_id' | 'completedAt'> = {
      challengeId: challengeId.toString(),
      userId: userId.toString(),
      spaceId: null,
      valid: true,
      baseXp: xpReward,
      bonusXp: 0,
      finalXp: xpReward,
      feedback: 'Integration test reward.',
      evidence: [],
    };

    const results = await Promise.allSettled([
      persistChallengeCompletion(completion),
      persistChallengeCompletion(completion),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find((result) => result.status === 'rejected');
    expect(rejected?.status).toBe('rejected');
    if (rejected?.status === 'rejected') {
      expect(rejected.reason).toBeInstanceOf(CompletionAlreadyClaimedError);
    }

    const savedUser = await getUsersCollection().findOne({ _id: userId });
    const savedChallenge = await getDb()
      .collection<ChallengeDoc>(COLLECTIONS.CHALLENGES)
      .findOne({ _id: challengeId });
    const savedCompletions = await getCompletionsCollection()
      .find({ userId: userId.toString(), challengeId: challengeId.toString() })
      .toArray();

    expect(savedUser?.totalXp).toBe(xpReward);
    expect(savedChallenge?.status).toBe('completed');
    expect(savedCompletions).toHaveLength(1);
    expect(savedCompletions[0]?.finalXp).toBe(xpReward);
  });

  it('rolls back the XP update if the challenge cannot be updated', async () => {
    const missingChallengeId = new ObjectId().toString();
    await expect(
      persistChallengeCompletion({
        challengeId: missingChallengeId,
        userId: userId.toString(),
        spaceId: null,
        valid: true,
        baseXp: xpReward,
        bonusXp: 0,
        finalXp: xpReward,
        feedback: 'This completion must roll back.',
        evidence: [],
      })
    ).rejects.toThrow('Challenge could not be updated while saving completion.');

    const savedUser = await getUsersCollection().findOne({ _id: userId });
    const savedCompletion = await getCompletionsCollection().findOne({
      userId: userId.toString(),
      challengeId: missingChallengeId,
    });
    expect(savedUser?.totalXp).toBe(xpReward);
    expect(savedCompletion).toBeNull();
  });
});

if (!testMongoUri) {
  console.info('MongoDB transaction integration test skipped; set MONGODB_TEST_URI to a disposable replica-set database to run it.');
}
