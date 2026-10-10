import {
  ChallengeGenerationContext,
  AIProvider,
} from '../providers/types.js';
import { GeneratedChallenge } from '@touch-grass/shared';
import { getFallbackChallenge } from '../fallbacks/fallbackChallenges.js';

export class ChallengeWorkflow {
  private provider: AIProvider;
  private maxRetries: number;

  constructor(provider: AIProvider, maxRetries = 2) {
    this.provider = provider;
    this.maxRetries = maxRetries;
  }

  async run(context: ChallengeGenerationContext): Promise<GeneratedChallenge> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const challenge = await this.provider.generateChallenge(context);
        return challenge;
      } catch (err: any) {
        lastError = err;
        console.warn(`[ChallengeWorkflow] Generation attempt ${attempt} failed:`, err.message);
      }
    }

    console.warn(
      `[ChallengeWorkflow] All ${this.maxRetries} attempts failed. Applying curated fallback challenge. Last error:`,
      lastError?.message
    );

    const fallback = getFallbackChallenge(
      context.request.experienceType,
      context.request.durationMinutes
    );

    return {
      ...fallback,
      difficulty: context.request.difficulty || fallback.difficulty,
      source: 'fallback',
    };
  }
}
