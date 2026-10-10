'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../../../../context/GameContext';
import { TactileButton, TactilePill } from '../../../../components/ui';

export default function PhoneAwayPage() {
  const router = useRouter();
  const { currentChallenge } = useGame();

  if (!currentChallenge) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="tactile-card-sage p-6 sm:p-8 text-center space-y-6 animate-scale-in">
      {/* Floating phone icon */}
      <div className="animate-phone-float w-20 h-20 rounded-full bg-[var(--primary-botanical)] text-white text-4xl flex items-center justify-center mx-auto border-4 border-[var(--ink-forest)] shadow-[0_4px_0_var(--ink-forest)]">
        📵
      </div>

      {/* Mission info */}
      <div className="animate-fade-in">
        <TactilePill variant="sky" className="text-xs uppercase mb-2">
          Mission Active
        </TactilePill>
        <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink-forest)] mt-1">
          {currentChallenge.title}
        </h2>
        <p className="text-base text-[var(--ink-forest)] max-w-lg mx-auto mt-2 font-medium">
          {currentChallenge.objective}
        </p>
      </div>

      {/* Phone-away message card */}
      <div
        className="bg-[var(--canvas-base)] p-5 rounded-2xl border-2 border-[var(--ink-forest)] max-w-md mx-auto space-y-2 animate-slide-up"
        style={{ animationDelay: '200ms' }}
      >
        <h3 className="font-extrabold text-[var(--ink-forest)] text-lg">
          Put your phone away.
        </h3>
        <p className="text-sm text-[var(--ink-muted)]">
          The phone is only the scoreboard. Step outside, enjoy the fresh air, and engage
          your senses. When you return with your discovery, submit your evidence below.
        </p>
      </div>

      {/* Timer visual */}
      <div className="flex items-center justify-center gap-2 text-sm text-[var(--ink-muted)] animate-pulse-glow">
        <span className="text-lg">⏱️</span>
        <span className="font-bold">{currentChallenge.durationMinutes} minute mission</span>
      </div>

      {/* Actions */}
      <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
        <TactileButton
          variant="yellow"
          onClick={() => router.push('/mission/submit')}
          className="py-3 px-8 text-base"
        >
          📸 I&apos;m Back! Record Evidence
        </TactileButton>
        <TactileButton
          variant="secondary"
          onClick={() => router.push('/dashboard')}
          className="py-3 px-6 text-sm"
        >
          Dashboard
        </TactileButton>
      </div>
    </div>
  );
}
