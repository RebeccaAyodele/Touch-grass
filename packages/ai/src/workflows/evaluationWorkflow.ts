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
      console.warn('[EvaluationWorkflow] Evidence evaluation failed:', err?.message ?? err);
      const unavailable = new Error('AI evaluation is temporarily unavailable. Your mission was not submitted; please try again.') as Error & { statusCode: number };
      unavailable.statusCode = 503;
      throw unavailable;
    }
  }
}
