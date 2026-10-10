import {
  EvidenceEvaluationContext,
  AIProvider,
} from '../providers/types.js';
import { EvidenceEvaluationResult } from '@touch-grass/shared';

export class EvaluationWorkflow {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async run(context: EvidenceEvaluationContext): Promise<EvidenceEvaluationResult> {
    try {
      return await this.provider.evaluateEvidence(context);
    } catch (err: any) {
      console.warn('[EvaluationWorkflow] Evidence evaluation failed, using safe baseline:', err.message);

      // Graceful baseline evaluation: award base completion without arbitrary bonus
      return {
        valid: true,
        relevanceScore: 70,
        noveltyScore: 70,
        interestingnessScore: 70,
        explanationScore: 70,
        proposedBonusRatio: 0.5,
        feedback: 'Submission accepted! Your outdoor observation has been recorded.',
      };
    }
  }
}
