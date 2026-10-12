import { EvidenceEvaluationResult } from '@touch-grass/shared';

export interface ScoreCalculationInput {
  baseXp: number;
  maxBonusXp: number;
  evaluation?: EvidenceEvaluationResult;
}

export interface ScoreCalculationOutput {
  valid: boolean;
  baseXp: number;
  bonusXp: number;
  finalXp: number;
  feedback: string;
}

/** Scales the earned score by the share of the selected mission time elapsed. */
export function applyDurationXpMultiplier(
  score: ScoreCalculationOutput,
  elapsedRatio: number
): ScoreCalculationOutput {
  if (!score.valid) return score;

  const multiplier = Math.max(0, Math.min(1, elapsedRatio));
  if (multiplier >= 1) return score;

  const baseXp = Math.floor(score.baseXp * multiplier);
  const finalXp = Math.floor(score.finalXp * multiplier);
  const bonusXp = Math.max(0, finalXp - baseXp);
  const percent = Math.round(multiplier * 100);

  return {
    ...score,
    baseXp,
    bonusXp,
    finalXp,
    feedback: `${score.feedback} XP was adjusted to ${percent}% of the mission reward because the mission was submitted before the selected time had elapsed.`,
  };
}

/**
 * Deterministically computes the awarded XP and bounds the AI bonus.
 * The AI can NEVER award XP above maxBonusXp.
 */
export function calculateFinalScore(input: ScoreCalculationInput): ScoreCalculationOutput {
  const { baseXp, maxBonusXp, evaluation } = input;

  if (!evaluation || !evaluation.valid) {
    // If invalid evidence or no evaluation provided for an honor-only task:
    const isValid = evaluation ? evaluation.valid : true;
    const bonusXp = 0;
    const finalXp = isValid ? baseXp : 0;
    const feedback = evaluation?.feedback ?? (isValid ? 'Mission completed!' : 'Submission did not meet requirements.');

    return {
      valid: isValid,
      baseXp: isValid ? baseXp : 0,
      bonusXp,
      finalXp,
      feedback,
    };
  }

  // Weight scores: relevance (40%), interestingness/novelty (30%), explanation (30%)
  const normalizedBonusRatio = Math.max(0, Math.min(1, evaluation.proposedBonusRatio));
  const calculatedBonus = Math.round(maxBonusXp * normalizedBonusRatio);
  const boundedBonus = Math.max(0, Math.min(maxBonusXp, calculatedBonus));

  return {
    valid: true,
    baseXp,
    bonusXp: boundedBonus,
    finalXp: baseXp + boundedBonus,
    feedback: evaluation.feedback || 'Great outdoor discovery!',
  };
}
