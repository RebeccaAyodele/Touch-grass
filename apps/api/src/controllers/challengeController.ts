import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  ChallengeRepository,
  UserRepository,
  CompletionRepository,
  SpaceRepository,
} from '@touch-grass/db';
import {
  ChallengeGenerateRequestSchema,
  ChallengeCompleteRequestSchema,
} from '@touch-grass/shared';
import {
  createAIProvider,
  ChallengeWorkflow,
  EvaluationWorkflow,
} from '@touch-grass/ai';
import {
  isValidStatusTransition,
  validateEvidenceRequirements,
  calculateFinalScore,
  calculateLevel,
} from '@touch-grass/game';
import { env } from '../config/env.js';

const aiProvider = createAIProvider({
  provider: env.AI_PROVIDER,
  baseUrl: env.AI_BASE_URL,
  apiKey: env.AI_API_KEY,
  model: env.AI_MODEL,
  timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
});

const challengeWorkflow = new ChallengeWorkflow(aiProvider);
const evaluationWorkflow = new EvaluationWorkflow(aiProvider);

export class ChallengeController {
  static async generate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const body = ChallengeGenerateRequestSchema.parse(req.body);

      if (body.spaceId) {
        const isMember = await SpaceRepository.isMember(body.spaceId, user.id);
        if (!isMember) {
          res.status(403).json({ error: 'You are not a member of this Space.' });
          return;
        }
      }

      // Fetch recent challenges to avoid repeating themes
      const recentChallenges = await ChallengeRepository.findRecentByUser(user.id, 5);
      const recentTitles = recentChallenges.map((c) => c.title);

      const generated = await challengeWorkflow.run({
        request: body,
        recentQuestTitles: recentTitles,
        userPreferredSetting: user.preferences?.preferredExperience,
      });

      const challenge = await ChallengeRepository.create({
        ...generated,
        createdBy: user.id,
        spaceId: body.spaceId ?? null,
        status: 'generated',
        startedAt: null,
        completedAt: null,
        expiresAt: null,
      });

      res.status(201).json({ challenge });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ error: 'Challenge ID is required.' });
      return;
    }

    const challenge = await ChallengeRepository.findByIdResponse(id);
    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found.' });
      return;
    }

    res.status(200).json({ challenge });
  }

  static async getActive(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const challenge = await ChallengeRepository.findActiveByUser(user.id);
    res.status(200).json({ challenge });
  }

  static async start(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const user = req.user!;

    if (!id) {
      res.status(400).json({ error: 'Challenge ID is required.' });
      return;
    }

    const challenge = await ChallengeRepository.findById(id);
    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found.' });
      return;
    }

    if (challenge.createdBy !== user.id && !challenge.spaceId) {
      res.status(403).json({ error: 'You are not authorized to start this challenge.' });
      return;
    }

    if (!isValidStatusTransition(challenge.status, 'active')) {
      res.status(400).json({ error: `Cannot start a challenge currently in status '${challenge.status}'.` });
      return;
    }

    const updated = await ChallengeRepository.updateStatus(id, 'active', 'startedAt');
    res.status(200).json({ challenge: updated });
  }

  static async complete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = req.user!;
      const { evidence } = ChallengeCompleteRequestSchema.parse(req.body);

      if (!id) {
        res.status(400).json({ error: 'Challenge ID is required.' });
        return;
      }

      const challengeDoc = await ChallengeRepository.findById(id);
      if (!challengeDoc) {
        res.status(404).json({ error: 'Challenge not found.' });
        return;
      }

      // Check idempotency: Has user already completed this challenge?
      const existingCompletion = await CompletionRepository.findByChallengeAndUser(id, user.id);
      if (existingCompletion) {
        res.status(409).json({ error: 'You have already completed and claimed rewards for this challenge.' });
        return;
      }

      // Validate required evidence
      const validationCheck = validateEvidenceRequirements(challengeDoc.verificationMethods, evidence);
      if (!validationCheck.valid) {
        res.status(400).json({
          error: 'Evidence submission incomplete.',
          details: validationCheck.errors,
        });
        return;
      }

      // Evaluate evidence via AI Workflow
      const evaluation = await evaluationWorkflow.run({
        challenge: {
          title: challengeDoc.title,
          description: challengeDoc.description,
          experienceType: challengeDoc.experienceType,
          durationMinutes: challengeDoc.durationMinutes,
          difficulty: challengeDoc.difficulty,
          storyIntro: challengeDoc.storyIntro,
          objective: challengeDoc.objective,
          instructions: challengeDoc.instructions,
          completionCriteria: challengeDoc.completionCriteria,
          verificationMethods: challengeDoc.verificationMethods,
          baseXp: challengeDoc.baseXp,
          maxBonusXp: challengeDoc.maxBonusXp,
          safetyNotes: challengeDoc.safetyNotes,
          accessibilityAlternative: challengeDoc.accessibilityAlternative,
          optionalBonusObjective: challengeDoc.optionalBonusObjective,
          source: challengeDoc.source,
        },
        evidence,
      });

      // Deterministic scoring calculation
      const scoreResult = calculateFinalScore({
        baseXp: challengeDoc.baseXp,
        maxBonusXp: challengeDoc.maxBonusXp,
        evaluation,
      });

      // Update user XP and calculate new level
      const currentXp = user.totalXp;
      const newTotalXp = currentXp + scoreResult.finalXp;
      const newLevel = calculateLevel(newTotalXp);
      const leveledUp = newLevel > user.level;

      await UserRepository.updateXpAndLevel(user.id, scoreResult.finalXp, newLevel);

      // Transition challenge to completed
      await ChallengeRepository.updateStatus(id, 'completed', 'completedAt');

      // Persist completion record
      const completion = await CompletionRepository.create(
        {
          challengeId: id,
          userId: user.id,
          spaceId: challengeDoc.spaceId ?? null,
          valid: scoreResult.valid,
          baseXp: scoreResult.baseXp,
          bonusXp: scoreResult.bonusXp,
          finalXp: scoreResult.finalXp,
          feedback: scoreResult.feedback,
          evaluation,
          evidence,
        },
        {
          newTotalXp,
          newLevel,
          leveledUp,
        }
      );

      res.status(200).json({ completion });
    } catch (err) {
      next(err);
    }
  }
}
