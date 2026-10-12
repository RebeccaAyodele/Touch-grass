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

  private async callChatCompletion(
    messages: Array<{ role: string; content: string }>,
    temperature = 0.7
  ): Promise<string> {
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
          temperature,
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

  private buildChallengeCandidate(parsed: any, context: ChallengeGenerationContext) {
      return {
        ...parsed,
        experienceType: context.request.experienceType,
        durationMinutes: context.request.durationMinutes,
        difficulty: context.request.difficulty || parsed?.difficulty || 'moderate',
        // Mission completion is recorded as a written log; never require invented photo evidence.
        verificationMethods: ['text_response'],
      // XP is calculated by the game engine, never trusted from model output.
      baseXp: calculateBaseXp(context.request.durationMinutes),
      maxBonusXp: calculateMaxBonusXp(context.request.durationMinutes),
      source: 'model' as const,
    };
  }

  private formatChallengeIssues(issues: Array<{ path: PropertyKey[]; message: string }>): string {
    return issues
      .map((issue) => `${issue.path.length ? issue.path.map(String).join('.') : 'response'}: ${issue.message}`)
      .join('; ');
  }

  async generateChallenge(context: ChallengeGenerationContext): Promise<GeneratedChallenge> {
    const systemPrompt = buildChallengeSystemPrompt();
    const userPrompt = buildChallengeUserPrompt(context);

    const rawResponse = await this.callChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const parsed = this.extractJson(rawResponse);
    const firstValidation = GeneratedChallengeSchema.safeParse(
      this.buildChallengeCandidate(parsed, context)
    );

    if (firstValidation.success) {
      return firstValidation.data;
    }

    const validationIssues = this.formatChallengeIssues(firstValidation.error.issues);
    console.warn(`[AI Provider] Challenge response failed schema validation; requesting one repair: ${validationIssues}`);

    const repairResponse = await this.callChatCompletion(
      [
        {
          role: 'system',
          content: [
            'You repair incomplete challenge JSON for Touch Grass.',
            'Return exactly one complete JSON object and no markdown or explanation.',
            'Preserve the valid challenge details from the previous response.',
            'Include every required field from the schema, especially instructions, completionCriteria, and verificationMethods.',
            'Do not omit required fields. Do not set XP fields; the server calculates them.',
          ].join(' '),
        },
        {
          role: 'user',
          content: [
            'Original challenge request and required JSON schema:',
            userPrompt,
            'Previous model JSON:',
            JSON.stringify(parsed),
            'Schema validation errors to fix:',
            validationIssues,
            'Return a complete replacement challenge object that fixes every listed error.',
          ].join('\n\n'),
        },
      ],
      0.2
    );

    const repaired = this.extractJson(repairResponse);
    const repairedValidation = GeneratedChallengeSchema.safeParse(
      this.buildChallengeCandidate(repaired, context)
    );

    if (!repairedValidation.success) {
      throw new Error(
        `Model challenge remained invalid after one repair: ${this.formatChallengeIssues(repairedValidation.error.issues)}`
      );
    }

    return repairedValidation.data;
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
