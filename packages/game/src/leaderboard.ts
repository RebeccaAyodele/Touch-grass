import { LeaderboardEntry } from '@touch-grass/shared';

export interface LeaderboardCandidate {
  userId: string;
  touchGrassId: string;
  username: string;
  totalXp: number;
  level: number;
  completedCount: number;
}

/**
 * Deterministically sorts and ranks players.
 * Ties in XP are broken by completed count, then alphabetically by username.
 */
export function rankPlayers(candidates: LeaderboardCandidate[]): LeaderboardEntry[] {
  const sorted = [...candidates].sort((a, b) => {
    if (b.totalXp !== a.totalXp) {
      return b.totalXp - a.totalXp;
    }
    if (b.completedCount !== a.completedCount) {
      return b.completedCount - a.completedCount;
    }
    return a.username.localeCompare(b.username);
  });

  return sorted.map((player, index) => ({
    rank: index + 1,
    userId: player.userId,
    touchGrassId: player.touchGrassId,
    username: player.username,
    totalXp: player.totalXp,
    level: player.level,
    completedCount: player.completedCount,
  }));
}
