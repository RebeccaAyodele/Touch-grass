import { z } from 'zod';
import {
  EXPERIENCE_TYPES,
  DURATIONS,
  DIFFICULTIES,
  VERIFICATION_METHODS,
  CHALLENGE_STATUSES,
  SPACE_ROLES,
  AI_SOURCES,
} from '../constants/index.js';

export const ExperienceTypeSchema = z.enum(EXPERIENCE_TYPES);
export const DurationSchema = z.union([
  z.literal(10),
  z.literal(20),
  z.literal(30),
  z.literal(60),
]);
export const DifficultySchema = z.enum(DIFFICULTIES);
export const VerificationMethodSchema = z.enum(VERIFICATION_METHODS);
export const ChallengeStatusSchema = z.enum(CHALLENGE_STATUSES);
export const SpaceRoleSchema = z.enum(SPACE_ROLES);
export const AISourceSchema = z.enum(AI_SOURCES);

// User Schemas
export const UserRegisterSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be under 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.confirmPassword.length === 0 || data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const UserUpdateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  preferences: z
    .object({
      preferredExperience: ExperienceTypeSchema.optional(),
      preferredDuration: DurationSchema.optional(),
      notifications: z.boolean().optional(),
    })
    .optional(),
});

export const UserResponseSchema = z.object({
  id: z.string(),
  touchGrassId: z.string(),
  username: z.string(),
  email: z.string(),
  totalXp: z.number(),
  level: z.number(),
  streak: z.number().default(0),
  preferences: z
    .object({
      preferredExperience: ExperienceTypeSchema.optional(),
      preferredDuration: DurationSchema.optional(),
      notifications: z.boolean().optional(),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Challenge Generation Schemas
export const ChallengeGenerateRequestSchema = z.object({
  experienceType: ExperienceTypeSchema,
  durationMinutes: DurationSchema,
  difficulty: DifficultySchema.default('moderate'),
  spaceId: z.string().optional().nullable(),
  locationContext: z
    .object({
      setting: z
        .enum(['balcony_or_patio', 'garden_or_yard', 'park', 'urban_street', 'general_outdoor'])
        .optional(),
      weatherHint: z.string().max(50).optional(),
    })
    .optional(),
});

export const GeneratedChallengeSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  experienceType: ExperienceTypeSchema,
  durationMinutes: DurationSchema,
  difficulty: DifficultySchema,
  storyIntro: z.string().max(300).optional(),
  objective: z.string().min(5).max(300),
  instructions: z.array(z.string().min(3).max(200)).min(1).max(5),
  completionCriteria: z.string().min(5).max(300),
  verificationMethods: z.array(VerificationMethodSchema).min(1),
  baseXp: z.number().int().positive(),
  maxBonusXp: z.number().int().nonnegative(),
  safetyNotes: z.string().max(300).optional(),
  accessibilityAlternative: z.string().max(300).optional(),
  optionalBonusObjective: z.string().max(300).optional(),
  source: AISourceSchema.default('model'),
});

export const ChallengeResponseSchema = GeneratedChallengeSchema.extend({
  id: z.string(),
  createdBy: z.string(),
  spaceId: z.string().nullable().optional(),
  status: ChallengeStatusSchema,
  createdAt: z.string(),
  startedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

// Evidence & Completion Schemas
export const EvidenceSubmissionSchema = z.object({
  challengeId: z.string(),
  type: VerificationMethodSchema,
  imageUrl: z.string().url().optional(),
  storagePublicId: z.string().optional(),
  textResponse: z.string().max(1000).optional(),
  observationNotes: z.string().max(1000).optional(),
});

export const EvidenceEvaluationResultSchema = z.object({
  valid: z.boolean(),
  relevanceScore: z.number().min(0).max(100),
  noveltyScore: z.number().min(0).max(100),
  interestingnessScore: z.number().min(0).max(100),
  explanationScore: z.number().min(0).max(100),
  proposedBonusRatio: z.number().min(0).max(1), // 0.0 to 1.0 (multiplier for maxBonusXp)
  feedback: z.string().max(400),
});

export const ChallengeCompleteRequestSchema = z.object({
  evidence: z.array(EvidenceSubmissionSchema).min(1),
});

export const CompletionResponseSchema = z.object({
  id: z.string(),
  challengeId: z.string(),
  userId: z.string(),
  spaceId: z.string().nullable().optional(),
  valid: z.boolean(),
  baseXp: z.number(),
  bonusXp: z.number(),
  finalXp: z.number(),
  newTotalXp: z.number(),
  newLevel: z.number(),
  leveledUp: z.boolean(),
  feedback: z.string(),
  evaluation: EvidenceEvaluationResultSchema.optional(),
  completedAt: z.string(),
});

// Spaces & Leaderboard Schemas
export const SpaceCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  description: z.string().max(200).optional(),
});

export const SpaceJoinSchema = z.object({
  inviteCode: z.string().min(4).max(20),
});

export const SpaceMemberSchema = z.object({
  userId: z.string(),
  touchGrassId: z.string(),
  username: z.string(),
  role: SpaceRoleSchema,
  totalXp: z.number(),
  level: z.number(),
  joinedAt: z.string(),
});

export const SpaceResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdBy: z.string(),
  inviteCode: z.string(),
  membersCount: z.number(),
  createdAt: z.string(),
  members: z.array(SpaceMemberSchema).optional(),
  activeChallenge: ChallengeResponseSchema.nullable().optional(),
});

export const LeaderboardEntrySchema = z.object({
  rank: z.number(),
  userId: z.string(),
  touchGrassId: z.string(),
  username: z.string(),
  totalXp: z.number(),
  level: z.number(),
  completedCount: z.number(),
});
