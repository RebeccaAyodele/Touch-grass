'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../../../../context/GameContext';
import { TactileCard, TactileButton, TactilePill } from '../../../../components/ui';

export default function BriefingPage() {
  const router = useRouter();
  const { currentChallenge, startChallenge, loading } = useGame();

  if (!currentChallenge) {
    router.push('/dashboard');
    return null;
  }

  async function handleStart() {
    try {
      await startChallenge();
      router.push('/mission/active');
    } catch {}
  }

  return (
    <TactileCard className="p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-3 border-b-2 border-[var(--border-sand)] pb-4 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <TactilePill variant="sage" className="text-xs uppercase">
              {currentChallenge.experienceType}
            </TactilePill>
            <TactilePill variant="gold" className="text-xs">
              {currentChallenge.durationMinutes} Minutes
            </TactilePill>
            <TactilePill variant="sky" className="text-xs uppercase">
              {currentChallenge.source}
            </TactilePill>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink-forest)] mt-2">
            {currentChallenge.title}
          </h2>
        </div>
        <div className="text-right shrink-0">
          <span className="section-sublabel">Stakes</span>
          <div className="text-lg font-black text-[var(--primary-botanical)]">
            +{currentChallenge.baseXp}{' '}
            <span className="text-xs text-[var(--ink-muted)]">
              up to +{currentChallenge.maxBonusXp} bonus
            </span>
          </div>
        </div>
      </div>

      {/* Story intro */}
      {currentChallenge.storyIntro && (
        <div className="animate-fade-in italic text-[var(--ink-forest)] bg-[var(--canvas-base)] p-4 rounded-lg border border-[var(--border-sand)]">
          &ldquo;{currentChallenge.storyIntro}&rdquo;
        </div>
      )}

      {/* Objective */}
      <div className="animate-slide-up">
        <span className="section-sublabel mb-1 block">Primary Objective</span>
        <p className="text-base font-bold text-[var(--ink-forest)]">{currentChallenge.objective}</p>
      </div>

      {/* Instructions */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <span className="section-sublabel mb-2 block">Step-by-Step Instructions</span>
        <ol className="space-y-2.5">
          {currentChallenge.instructions.map((inst: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[var(--ink-forest)]">
              <span className="w-6 h-6 rounded-full bg-[var(--surface-sage)] border border-[var(--ink-forest)] flex items-center justify-center font-bold text-xs shrink-0">
                {i + 1}
              </span>
              <span>{inst}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Safety note */}
      {currentChallenge.safetyNotes && (
        <div className="p-3 bg-[var(--canvas-base)] border border-[var(--ink-forest)] rounded-lg text-xs text-[var(--ink-forest)] animate-fade-in">
          <span className="font-bold">🛡️ Safety Note:</span> {currentChallenge.safetyNotes}
        </div>
      )}

      {/* Accessibility */}
      {currentChallenge.accessibilityAlternative && (
        <div className="p-3 bg-[var(--surface-sage)] rounded-lg text-xs text-[var(--ink-forest)] animate-fade-in">
          <span className="font-bold">♿ Accessibility Alternative:</span> {currentChallenge.accessibilityAlternative}
        </div>
      )}

      {/* Actions */}
      <div className="pt-4 flex flex-col sm:flex-row gap-3">
        <TactileButton
          onClick={handleStart}
          loading={loading}
          className="flex-1 py-3.5 text-lg"
        >
          🚀 START MISSION · PUT PHONE AWAY
        </TactileButton>
        <TactileButton
          variant="secondary"
          onClick={() => router.push('/dashboard')}
          className="py-3.5 px-6"
        >
          Back to Hub
        </TactileButton>
      </div>
    </TactileCard>
  );
}
