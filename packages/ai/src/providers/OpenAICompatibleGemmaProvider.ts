import {
  AIProvider,
  ChallengeGenerationContext,
  EvidenceEvaluationContext,
} from './types.js';
import {
  GeneratedChallenge,
  GeneratedChallengeSchema,
  EvidenceEvaluationResult,
  EvidenceEvaluationResultSchema,
} from '@touch-grass/shared';
import { calculateBaseXp, calculateMaxBonusXp } from '@touch-grass/game';
import {
  buildChallengeSystemPrompt,
  buildChallengeUserPrompt,
} from '../prompts/challengePrompts.js';
import {
  buildEvaluationSystemPrompt,
  buildEvaluationUserPrompt,
} from '../prompts/evaluationPrompts.js';

export interface OpenAICompatibleConfig {
  name?: string;
  baseUrl: string;
  apiKey?: string;
  model: string;
  timeoutMs?: number;
}

export class OpenAICompatibleGemmaProvider implements AIProvider {
  name: string;
  private baseUrl: string;
  private apiKey: string;
  private model: string;
  private timeoutMs: number;

  constructor(config: OpenAICompatibleConfig) {
    this.name = config.name || `Gemma Provider (${config.model})`;
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey || '';
    this.model = config.model;
    this.timeoutMs = config.timeoutMs || 30000;
  }

  private async callChatCompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Inference endpoint returned HTTP ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as any;
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No completion choices returned by model');
      }

      return content;
    } finally {
      clearTimeout(timer);
    }
  }

  private extractJson(raw: string): any {
    try {
      return JSON.parse(raw);
    } catch {
      // Clean possible markdown code fences
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      return JSON.parse(cleaned);
    }
  }

  async generateChallenge(context: ChallengeGenerationContext): Promise<GeneratedChallenge> {
    const systemPrompt = buildChallengeSystemPrompt();
    const userPrompt = buildChallengeUserPrompt(context);

    const rawResponse = await this.callChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const parsed = this.extractJson(rawResponse);

    // Compute authoritative deterministic XP values
    const baseXp = calculateBaseXp(context.request.durationMinutes);
    const maxBonusXp = calculateMaxBonusXp(context.request.durationMinutes);

    const challengeCandidate = {
      ...parsed,
      experienceType: context.request.experienceType,
      durationMinutes: context.request.durationMinutes,
      difficulty: context.request.difficulty || parsed.difficulty || 'moderate',
      baseXp,
      maxBonusXp,
      source: 'model' as const,
    };

    // Strict validation
    return GeneratedChallengeSchema.parse(challengeCandidate);
  }

  async evaluateEvidence(context: EvidenceEvaluationContext): Promise<EvidenceEvaluationResult> {
    const systemPrompt = buildEvaluationSystemPrompt();
    const userPrompt = buildEvaluationUserPrompt(context);

    const rawResponse = await this.callChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const parsed = this.extractJson(rawResponse);
    return EvidenceEvaluationResultSchema.parse(parsed);
  }
}
