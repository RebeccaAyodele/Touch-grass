import {
  getUsersCollection,
  getChallengesCollection,
  getCompletionsCollection,
  getSpacesCollection,
  getSpaceMembersCollection,
} from './collections.js';
import { getDb } from './client.js';

/**
 * Creates all required indexes for performance, uniqueness, and data integrity.
 */
export async function ensureDatabaseIndexes(): Promise<void> {
  const users = getUsersCollection();
  const challenges = getChallengesCollection();
  const completions = getCompletionsCollection();
  const spaces = getSpacesCollection();
  const spaceMembers = getSpaceMembersCollection();
  const rateLimits = getDb().collection('api_rate_limits');

  // Users indexes
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ username: 1 }, { unique: true, collation: { locale: 'en', strength: 2 }, name: 'username_case_insensitive_unique' });
  await users.createIndex({ touchGrassId: 1 }, { unique: true });
  await users.createIndex({ totalXp: -1 });

  // Challenges indexes
  await challenges.createIndex({ createdBy: 1, createdAt: -1 });
  await challenges.createIndex({ spaceId: 1, createdAt: -1 });
  await challenges.createIndex({ status: 1 });

  // Completions indexes (Ensures idempotent completion per user per challenge)
  await completions.createIndex({ userId: 1, challengeId: 1 }, { unique: true });
  await completions.createIndex({ userId: 1, completedAt: -1 });
  await completions.createIndex({ spaceId: 1, completedAt: -1 });

  // Spaces indexes
  await spaces.createIndex({ inviteCode: 1 }, { unique: true });
  await spaces.createIndex({ createdBy: 1 });

  // Space Members compound index
  await spaceMembers.createIndex({ spaceId: 1, userId: 1 }, { unique: true });
  await spaceMembers.createIndex({ userId: 1 });

  // Shared rate-limit buckets expire automatically across serverless instances.
  await rateLimits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'rate_limit_expiry' });
}
