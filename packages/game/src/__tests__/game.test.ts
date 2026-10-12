import { describe, it, expect } from 'vitest';
import {
  calculateBaseXp,
  calculateMaxBonusXp,
  calculateLevel,
  xpForLevel,
  calculateLevelProgress,
  calculateFinalScore,
  applyDurationXpMultiplier,
  isValidStatusTransition,
  validateEvidenceRequirements,
  rankPlayers,
} from '../index.js';

describe('Game Engine - Deterministic Calculations', () => {
  describe('XP calculations', () => {
    it('returns correct base and bonus XP for supported durations', () => {
      expect(calculateBaseXp(10)).toBe(200);
      expect(calculateBaseXp(20)).toBe(350);
      expect(calculateBaseXp(30)).toBe(500);
      expect(calculateBaseXp(60)).toBe(750);

      expect(calculateMaxBonusXp(10)).toBe(80);
      expect(calculateMaxBonusXp(20)).toBe(140);
      expect(calculateMaxBonusXp(30)).toBe(200);
      expect(calculateMaxBonusXp(60)).toBe(300);
    });
  });

  describe('Level Progression', () => {
    it('calculates XP required for levels according to formula 100 * (N-1) * N / 2', () => {
      expect(xpForLevel(1)).toBe(0);
      expect(xpForLevel(2)).toBe(100);
      expect(xpForLevel(3)).toBe(300);
      expect(xpForLevel(4)).toBe(600);
      expect(xpForLevel(5)).toBe(1000);
    });

    it('calculates level accurately from total XP', () => {
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(99)).toBe(1);
      expect(calculateLevel(100)).toBe(2);
      expect(calculateLevel(299)).toBe(2);
      expect(calculateLevel(300)).toBe(3);
      expect(calculateLevel(600)).toBe(4);
      expect(calculateLevel(1000)).toBe(5);
    });

    it('calculates level progress percentage', () => {
      const progress = calculateLevelProgress(200);
      expect(progress.level).toBe(2);
      expect(progress.currentLevelXp).toBe(100);
      expect(progress.nextLevelXp).toBe(300);
      expect(progress.xpInCurrentLevel).toBe(100);
      expect(progress.xpNeededForNextLevel).toBe(200);
      expect(progress.progressPercent).toBe(50);
    });
  });

  describe('Scoring & AI Bonus Bounding', () => {
    it('strictly caps bonus XP to maxBonusXp even if ratio exceeds bounds', () => {
      const result = calculateFinalScore({
        baseXp: 500,
        maxBonusXp: 200,
        evaluation: {
          valid: true,
          relevanceScore: 95,
          noveltyScore: 90,
          interestingnessScore: 90,
          explanationScore: 90,
          proposedBonusRatio: 1.5, // Attempting to exceed max
          feedback: 'Outstanding discovery!',
        },
      });

      expect(result.valid).toBe(true);
      expect(result.baseXp).toBe(500);
      expect(result.bonusXp).toBe(200); // Capped at maxBonusXp
      expect(result.finalXp).toBe(700);
    });

    it('handles zero or invalid submissions without awarding XP', () => {
      const result = calculateFinalScore({
        baseXp: 500,
        maxBonusXp: 200,
        evaluation: {
          valid: false,
          relevanceScore: 10,
          noveltyScore: 10,
          interestingnessScore: 10,
          explanationScore: 10,
          proposedBonusRatio: 0,
          feedback: 'Evidence did not match.',
        },
      });

      expect(result.valid).toBe(false);
      expect(result.finalXp).toBe(0);
    });

    it('reduces XP in proportion to the selected mission time that elapsed', () => {
      const score = calculateFinalScore({ baseXp: 350, maxBonusXp: 140 });
      const adjusted = applyDurationXpMultiplier(score, 0.75);

      expect(adjusted.baseXp).toBe(262);
      expect(adjusted.finalXp).toBe(262);
      expect(adjusted.bonusXp).toBe(0);
      expect(adjusted.feedback).toContain('adjusted to 75%');
    });

    it('awards the full score after the selected time has elapsed', () => {
      const score = calculateFinalScore({ baseXp: 350, maxBonusXp: 140 });
      expect(applyDurationXpMultiplier(score, 1.2)).toEqual(score);
    });
  });

  describe('Validation Rules', () => {
    it('permits only valid status transitions', () => {
      expect(isValidStatusTransition('generated', 'active')).toBe(true);
      expect(isValidStatusTransition('active', 'completed')).toBe(true);
      expect(isValidStatusTransition('completed', 'active')).toBe(false);
      expect(isValidStatusTransition('abandoned', 'completed')).toBe(false);
    });

    it('validates evidence requirements accurately', () => {
      const check = validateEvidenceRequirements(['photo', 'text_response'], [
        {
          challengeId: '123',
          type: 'photo',
          imageUrl: 'https://example.com/leaf.jpg',
        },
        {
          challengeId: '123',
          type: 'text_response',
          textResponse: 'Found an oak leaf near the trail.',
        },
      ]);

      expect(check.valid).toBe(true);
      expect(check.errors.length).toBe(0);
    });

    it('detects missing required evidence', () => {
      const check = validateEvidenceRequirements(['photo'], []);
      expect(check.valid).toBe(false);
      expect(check.missingMethods).toContain('photo');
    });
  });

  describe('Leaderboard Ranking', () => {
    it('sorts candidates deterministically by XP, completed count, and username', () => {
      const ranked = rankPlayers([
        { userId: '1', touchGrassId: 'TG-1', username: 'Alice', totalXp: 500, level: 3, completedCount: 2 },
        { userId: '2', touchGrassId: 'TG-2', username: 'Bob', totalXp: 800, level: 4, completedCount: 3 },
        { userId: '3', touchGrassId: 'TG-3', username: 'Charlie', totalXp: 500, level: 3, completedCount: 3 },
      ]);

      expect(ranked[0]?.username).toBe('Bob'); // 800 XP
      expect(ranked[1]?.username).toBe('Charlie'); // 500 XP, 3 completed
      expect(ranked[2]?.username).toBe('Alice'); // 500 XP, 2 completed
      expect(ranked[0]?.rank).toBe(1);
      expect(ranked[1]?.rank).toBe(2);
      expect(ranked[2]?.rank).toBe(3);
    });
  });
});
