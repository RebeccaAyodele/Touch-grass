import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  ChallengeRepository,
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
  applyDurationXpMultiplier,
} from '@touch-grass/game';
import { env } from '../config/env.js';
import { CompletionAlreadyClaimedError, persistChallengeCompletion } from '../services/completionService.js';

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

    const updated = await ChallengeRepository.start(id, challenge.durationMinutes);
    if (!updated) {
      res.status(409).json({ error: 'This challenge has already been started or changed.' });
      return;
    }
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

      if (challengeDoc.status !== 'active' || !challengeDoc.startedAt) {
        res.status(409).json({ error: 'Start this challenge before submitting your mission log.' });
        return;
      }

      // Capture submission time before evidence validation/AI latency affects processing.
      const submittedAt = new Date();

      // Return a clear conflict for requests made after a completion is committed.
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

      // Invalid evidence is feedback for another attempt, not a completed mission.
      if (!evaluation.valid) {
        res.status(422).json({
          error: 'This log does not yet show how you completed the mission.',
          feedback: evaluation.feedback,
          evaluation,
        });
        return;
      }

      // Deterministic scoring calculation
      const baseScore = calculateFinalScore({
        baseXp: challengeDoc.baseXp,
        maxBonusXp: challengeDoc.maxBonusXp,
        evaluation,
      });
      const durationMs = challengeDoc.durationMinutes * 60_000;
      const elapsedMs = Math.max(0, submittedAt.getTime() - challengeDoc.startedAt.getTime());
      const elapsedRatio = durationMs > 0 ? Math.min(1, elapsedMs / durationMs) : 1;
      const scoreResult = applyDurationXpMultiplier(baseScore, elapsedRatio);

      const completion = await persistChallengeCompletion({
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
      });

      res.status(200).json({ completion });
    } catch (err) {
      if (err instanceof CompletionAlreadyClaimedError) {
        res.status(409).json({ error: err.message });
        return;
      }
      next(err);
    }
  }
}
