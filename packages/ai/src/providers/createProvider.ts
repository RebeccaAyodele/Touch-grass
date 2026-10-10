import { AIProvider } from './types.js';
import { MockAIProvider } from './MockAIProvider.js';
import { OpenAICompatibleGemmaProvider } from './OpenAICompatibleGemmaProvider.js';

export interface ProviderEnvConfig {
  provider?: string;
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
}

/**
 * Creates and configures the appropriate AI provider instance.
 */
export function createAIProvider(env: ProviderEnvConfig = {}): AIProvider {
  const providerType = (env.provider || process.env.AI_PROVIDER || 'mock').toLowerCase();

  if (providerType === 'mock') {
    return new MockAIProvider();
  }

  const baseUrl = env.baseUrl || process.env.AI_BASE_URL;
  const apiKey = env.apiKey || process.env.AI_API_KEY || '';
  const model = env.model || process.env.AI_MODEL || 'gemma-2-9b-it';
  const timeoutMs = env.timeoutMs || Number(process.env.AI_REQUEST_TIMEOUT_MS) || 30000;

  if (providerType === 'ollama') {
    return new OpenAICompatibleGemmaProvider({
      name: `Local Ollama (${model})`,
      baseUrl: baseUrl || 'http://localhost:11434/v1',
      apiKey: 'ollama',
      model,
      timeoutMs,
    });
  }

  if (providerType === 'groq') {
    return new OpenAICompatibleGemmaProvider({
      name: `Groq (${model})`,
      baseUrl: baseUrl || 'https://api.groq.com/openai/v1',
      apiKey,
      model: model || 'gemma2-9b-it',
      timeoutMs,
    });
  }

  if (providerType === 'together') {
    return new OpenAICompatibleGemmaProvider({
      name: `Together AI (${model})`,
      baseUrl: baseUrl || 'https://api.together.xyz/v1',
      apiKey,
      model: model || 'google/gemma-2-9b-it',
      timeoutMs,
    });
  }

  if (providerType === 'openrouter') {
    return new OpenAICompatibleGemmaProvider({
      name: `OpenRouter (${model})`,
      baseUrl: baseUrl || 'https://openrouter.ai/api/v1',
      apiKey,
      model: model || 'google/gemma-2-9b-it',
      timeoutMs,
    });
  }

  if (baseUrl) {
    return new OpenAICompatibleGemmaProvider({
      name: `Custom Endpoint (${model})`,
      baseUrl,
      apiKey,
      model,
      timeoutMs,
    });
  }

  // Fallback to Mock if unconfigured
  console.warn(`[AI Provider] Unrecognized or unconfigured AI_PROVIDER='${providerType}', falling back to MockAIProvider.`);
  return new MockAIProvider();
}
