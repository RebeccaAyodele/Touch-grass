'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../../../../context/GameContext';
import { TactileCard, TactileButton, TactilePill } from '../../../../components/ui';
import { LevelUpCelebration } from '../../../../components/LevelUpCelebration';

export default function ResultsPage() {
  const router = useRouter();
  const { lastCompletion, lastEvidence, clearChallenge } = useGame();
  const [showLevelUp, setShowLevelUp] = useState(true);

  if (!lastCompletion) {
    router.push('/dashboard');
    return null;
  }

  function handleNextExpedition() {
    clearChallenge();
    router.push('/dashboard');
  }

  return (
    <>
      {/* Level Up Celebration Overlay */}
      {lastCompletion.leveledUp && showLevelUp && (
        <LevelUpCelebration
          newLevel={lastCompletion.newLevel}
          onComplete={() => setShowLevelUp(false)}
        />
      )}

      <div className="tactile-card-sage p-6 sm:p-8 text-center space-y-6 animate-scale-in">
        {/* Trophy icon */}
        <div className="animate-celebration">
          <div className="w-20 h-20 rounded-full bg-[var(--accent-gold)] text-4xl flex items-center justify-center mx-auto border-3 border-[var(--ink-forest)] shadow-[0_4px_0_var(--ink-forest)]">
            🎉
          </div>
        </div>

        {/* XP Summary */}
        <div className="animate-fade-in">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--primary-botanical)]">
            Challenge Accomplished!
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--ink-forest)] mt-1">
            +{lastCompletion.finalXp} XP
          </h2>
          <p className="text-sm text-[var(--ink-muted)] mt-1">Total XP Awarded</p>
        </div>

        {/* XP Breakdown */}
        <div className="flex justify-center items-center gap-2 flex-wrap animate-slide-up">
          <TactilePill variant="sage" className="text-xs">
            Base: +{lastCompletion.baseXp} XP
          </TactilePill>
          <TactilePill variant="gold" className="text-xs">
            Discovery Bonus: +{lastCompletion.bonusXp} XP
          </TactilePill>
        </div>

        {/* AI Feedback */}
        {lastCompletion.feedback && (
          <div
            className="bg-white p-4 rounded-xl border-2 border-[var(--ink-forest)] max-w-md mx-auto text-sm text-[var(--ink-forest)] italic animate-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            &ldquo;{lastCompletion.feedback}&rdquo;
          </div>
        )}

        {lastEvidence.find((item) => item.type === 'text_response')?.textResponse && (
          <section className="bg-[var(--canvas-cream)] p-4 rounded-xl border border-[var(--border-sand)] max-w-md mx-auto text-left animate-slide-up">
            <h3 className="text-sm font-extrabold text-[var(--ink-forest)]">Your mission log</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)] whitespace-pre-wrap">
              {lastEvidence.find((item) => item.type === 'text_response')?.textResponse}
            </p>
          </section>
        )}

        {/* Level Up Card (inline, in addition to the overlay) */}
        {lastCompletion.leveledUp && (
          <div
            className="animate-level-up tactile-card bg-[var(--accent-gold)] p-4 text-[var(--ink-forest)] font-extrabold max-w-xs mx-auto"
          >
            ⭐ LEVEL UP! You reached Level {lastCompletion.newLevel}!
          </div>
        )}

        {/* Action */}
        <div className="pt-4">
          <TactileButton onClick={handleNextExpedition} className="py-3 px-8 text-base">
            Next Expedition 🌿
          </TactileButton>
        </div>
      </div>
    </>
  );
}
