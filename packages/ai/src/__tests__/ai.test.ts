import { describe, it, expect } from 'vitest';
import {
  MockAIProvider,
  createAIProvider,
  ChallengeWorkflow,
  getFallbackChallenge,
} from '../index.js';

describe('AI System - Challenge Generation & Evaluation', () => {
  it('instantiates MockAIProvider correctly', async () => {
    const provider = new MockAIProvider();
    const challenge = await provider.generateChallenge({
      request: {
        experienceType: 'observe',
        durationMinutes: 20,
        difficulty: 'moderate',
      },
    });

    expect(challenge.experienceType).toBe('observe');
    expect(challenge.durationMinutes).toBe(20);
    expect(challenge.baseXp).toBe(350);
    expect(challenge.maxBonusXp).toBe(140);
    expect(challenge.source).toBe('mock');
    expect(challenge.instructions.length).toBeGreaterThanOrEqual(1);
  });

  it('runs ChallengeWorkflow and falls back on simulated failure', async () => {
    const failingProvider = {
      name: 'Failing Provider',
      generateChallenge: async () => {
        throw new Error('Simulated API down');
      },
      evaluateEvidence: async () => {
        throw new Error('Simulated API down');
      },
    };

    const workflow = new ChallengeWorkflow(failingProvider, 1);
    const challenge = await workflow.run({
      request: {
        experienceType: 'calm',
        durationMinutes: 10,
        difficulty: 'easy',
      },
    });

    expect(challenge.source).toBe('fallback');
    expect(challenge.baseXp).toBe(200);
  });

  it('evaluates evidence via MockAIProvider', async () => {
    const provider = new MockAIProvider();
    const challenge = getFallbackChallenge('discover', 30);
    const evaluation = await provider.evaluateEvidence({
      challenge,
      evidence: [
        {
          challengeId: 'test-id',
          type: 'photo',
          imageUrl: 'https://example.com/sprout.jpg',
          textResponse: 'Noticed a new clover sprout in the lawn.',
        },
      ],
    });

    expect(evaluation.valid).toBe(true);
    expect(evaluation.relevanceScore).toBeGreaterThanOrEqual(70);
    expect(evaluation.proposedBonusRatio).toBeGreaterThan(0);
  });

  it('creates provider from environment config', () => {
    const provider = createAIProvider({ provider: 'mock' });
    expect(provider).toBeInstanceOf(MockAIProvider);
  });
});
