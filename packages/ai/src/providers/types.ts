import {
  ChallengeGenerateRequest,
  GeneratedChallenge,
  EvidenceSubmission,
  EvidenceEvaluationResult,
} from '@touch-grass/shared';

export interface ChallengeGenerationContext {
  request: ChallengeGenerateRequest;
  recentQuestTitles?: string[];
  userPreferredSetting?: string;
}

export interface EvidenceEvaluationContext {
  challenge: GeneratedChallenge;
  evidence: EvidenceSubmission[];
}

export interface AIProvider {
  name: string;
  generateChallenge(context: ChallengeGenerationContext): Promise<GeneratedChallenge>;
  evaluateEvidence(context: EvidenceEvaluationContext): Promise<EvidenceEvaluationResult>;
}
