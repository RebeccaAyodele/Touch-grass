import { Collection } from 'mongodb';
import { getDb } from './client.js';
import {
  UserDoc,
  ChallengeDoc,
  CompletionDoc,
  SpaceDoc,
  SpaceMemberDoc,
} from '@touch-grass/shared';

export const COLLECTIONS = {
  USERS: 'users',
  CHALLENGES: 'challenges',
  COMPLETIONS: 'completions',
  SPACES: 'spaces',
  SPACE_MEMBERS: 'space_members',
} as const;

export function getUsersCollection(): Collection<UserDoc> {
  return getDb().collection<UserDoc>(COLLECTIONS.USERS);
}

export function getChallengesCollection(): Collection<ChallengeDoc> {
  return getDb().collection<ChallengeDoc>(COLLECTIONS.CHALLENGES);
}

export function getCompletionsCollection(): Collection<CompletionDoc> {
  return getDb().collection<CompletionDoc>(COLLECTIONS.COMPLETIONS);
}

export function getSpacesCollection(): Collection<SpaceDoc> {
  return getDb().collection<SpaceDoc>(COLLECTIONS.SPACES);
}

export function getSpaceMembersCollection(): Collection<SpaceMemberDoc> {
  return getDb().collection<SpaceMemberDoc>(COLLECTIONS.SPACE_MEMBERS);
}
