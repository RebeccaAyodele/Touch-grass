import { z } from 'zod';
import {
  ExperienceTypeSchema,
  DurationSchema,
  DifficultySchema,
  VerificationMethodSchema,
  ChallengeStatusSchema,
  SpaceRoleSchema,
  AISourceSchema,
  UserRegisterSchema,
  UserLoginSchema,
  UserUpdateProfileSchema,
  UserResponseSchema,
  ChallengeGenerateRequestSchema,
  GeneratedChallengeSchema,
  ChallengeResponseSchema,
  EvidenceSubmissionSchema,
  EvidenceEvaluationResultSchema,
  ChallengeCompleteRequestSchema,
  CompletionResponseSchema,
  SpaceCreateSchema,
  SpaceJoinSchema,
  SpaceMemberSchema,
  SpaceResponseSchema,
  LeaderboardEntrySchema,
} from '../schemas/index.js';

export type ExperienceType = z.infer<typeof ExperienceTypeSchema>;
export type DurationMinutes = z.infer<typeof DurationSchema>;
export type Difficulty = z.infer<typeof DifficultySchema>;
export type VerificationMethod = z.infer<typeof VerificationMethodSchema>;
export type ChallengeStatus = z.infer<typeof ChallengeStatusSchema>;
export type SpaceRole = z.infer<typeof SpaceRoleSchema>;
export type AISource = z.infer<typeof AISourceSchema>;

export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;
export type UserLoginInput = z.infer<typeof UserLoginSchema>;
export type UserUpdateProfileInput = z.infer<typeof UserUpdateProfileSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;

export type ChallengeGenerateRequest = z.infer<typeof ChallengeGenerateRequestSchema>;
export type GeneratedChallenge = z.infer<typeof GeneratedChallengeSchema>;
export type ChallengeResponse = z.infer<typeof ChallengeResponseSchema>;

export type EvidenceSubmission = z.infer<typeof EvidenceSubmissionSchema>;
export type EvidenceEvaluationResult = z.infer<typeof EvidenceEvaluationResultSchema>;
export type ChallengeCompleteRequest = z.infer<typeof ChallengeCompleteRequestSchema>;
export type CompletionResponse = z.infer<typeof CompletionResponseSchema>;

export type SpaceCreateInput = z.infer<typeof SpaceCreateSchema>;
export type SpaceJoinInput = z.infer<typeof SpaceJoinSchema>;
export type SpaceMember = z.infer<typeof SpaceMemberSchema>;
export type SpaceResponse = z.infer<typeof SpaceResponseSchema>;

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

// Internal database document types
export interface UserDoc {
  _id?: any;
  touchGrassId: string;
  username: string;
  email: string;
  passwordHash: string;
  totalXp: number;
  level: number;
  streak: number;
  preferences?: {
    preferredExperience?: ExperienceType;
    preferredDuration?: DurationMinutes;
    notifications?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeDoc {
  _id?: any;
  createdBy: string; // userId
  spaceId?: string | null;
  experienceType: ExperienceType;
  title: string;
  description: string;
  durationMinutes: DurationMinutes;
  difficulty: Difficulty;
  storyIntro?: string;
  objective: string;
  instructions: string[];
  completionCriteria: string;
  verificationMethods: VerificationMethod[];
  baseXp: number;
  maxBonusXp: number;
  safetyNotes?: string;
  accessibilityAlternative?: string;
  optionalBonusObjective?: string;
  source: AISource;
  status: ChallengeStatus;
  createdAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
  expiresAt?: Date | null;
}

export interface CompletionDoc {
  _id?: any;
  challengeId: string;
  userId: string;
  spaceId?: string | null;
  valid: boolean;
  baseXp: number;
  bonusXp: number;
  finalXp: number;
  feedback: string;
  evaluation?: EvidenceEvaluationResult;
  evidence: EvidenceSubmission[];
  completedAt: Date;
}

export interface SpaceDoc {
  _id?: any;
  name: string;
  description?: string;
  createdBy: string;
  inviteCode: string;
  activeChallengeId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpaceMemberDoc {
  _id?: any;
  spaceId: string;
  userId: string;
  role: SpaceRole;
  joinedAt: Date;
}
