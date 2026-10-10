export const EXPERIENCE_TYPES = [
  'calm',
  'explore',
  'social',
  'active',
  'observe',
  'discover',
  'surprise',
] as const;

export const DURATIONS = [10, 20, 30, 60] as const;

export const DIFFICULTIES = ['easy', 'moderate', 'adventurous'] as const;

export const VERIFICATION_METHODS = [
  'photo',
  'text_response',
  'observation',
  'honor',
] as const;

export const CHALLENGE_STATUSES = [
  'generated',
  'active',
  'completed',
  'expired',
  'abandoned',
] as const;

export const SPACE_ROLES = ['owner', 'member'] as const;

export const AI_SOURCES = ['model', 'fallback', 'mock'] as const;

// XP Configuration Constants (Deterministic)
export const DURATION_BASE_XP: Record<number, number> = {
  10: 200,
  20: 350,
  30: 500,
  60: 750,
};

export const DURATION_MAX_BONUS_XP: Record<number, number> = {
  10: 80,
  20: 140,
  30: 200,
  60: 300,
};
