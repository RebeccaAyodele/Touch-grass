/**
 * Returns total XP required to reach a specific level.
 * Formula: 100 * (N - 1) * N / 2
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor((100 * (level - 1) * level) / 2);
}

/**
 * Calculates current level from total accumulated XP.
 * XP cannot be negative.
 */
export function calculateLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;

  // Solve 50 * (N^2 - N) <= totalXp
  // N^2 - N - (totalXp / 50) <= 0
  const discriminant = 1 + (4 * totalXp) / 50;
  const n = (1 + Math.sqrt(discriminant)) / 2;
  return Math.max(1, Math.floor(n));
}

export interface LevelProgress {
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
}

/**
 * Detailed level progress for UI rendering.
 */
export function calculateLevelProgress(totalXp: number): LevelProgress {
  const safeXp = Math.max(0, totalXp);
  const currentLevel = calculateLevel(safeXp);
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);

  const xpInCurrentLevel = safeXp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  const progressPercent =
    xpNeededForNextLevel > 0
      ? Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100))
      : 100;

  return {
    level: currentLevel,
    totalXp: safeXp,
    currentLevelXp,
    nextLevelXp,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
  };
}
