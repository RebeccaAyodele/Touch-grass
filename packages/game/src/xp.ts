import { DURATION_BASE_XP, DURATION_MAX_BONUS_XP, DurationMinutes } from '@touch-grass/shared';

/**
 * Returns the deterministic base XP for a given quest duration.
 */
export function calculateBaseXp(durationMinutes: DurationMinutes): number {
  return DURATION_BASE_XP[durationMinutes] ?? 200;
}

/**
 * Returns the maximum allowed discovery/evaluation bonus XP for a given duration.
 */
export function calculateMaxBonusXp(durationMinutes: DurationMinutes): number {
  return DURATION_MAX_BONUS_XP[durationMinutes] ?? 80;
}
