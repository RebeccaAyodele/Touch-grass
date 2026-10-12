'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChallengeGenerateRequest, DurationMinutes, ExperienceType } from '@touch-grass/shared';
import { useGame } from '../../../context/GameContext';
import { TactileCard, TactileButton, ProgressBar } from '../../../components/ui';

const CATEGORIES = [
  { id: 'observe', name: 'Observe' },
  { id: 'calm', name: 'Calm' },
  { id: 'discover', name: 'Discover' },
  { id: 'explore', name: 'Explore' },
  { id: 'active', name: 'Active' },
  { id: 'social', name: 'Social' },
  { id: 'surprise', name: 'Surprise me' },
] as const;

const DURATIONS = [
  { min: 10 },
  { min: 20 },
  { min: 30 },
  { min: 60 },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];
type GenerateParams = Pick<ChallengeGenerateRequest, 'experienceType' | 'durationMinutes'>;

export default function DashboardPage() {
  const router = useRouter();
  const { user, currentChallenge, levelProgress, loading, generateChallenge } = useGame();

  const [selectedCategory, setSelectedCategory] = useState<ExperienceType>('observe');
  const [selectedDuration, setSelectedDuration] = useState<DurationMinutes>(20);

  async function handleGenerate() {
    if (!user) {
      router.push('/login');
      return;
    }

    const params: GenerateParams = {
      experienceType: selectedCategory,
      durationMinutes: selectedDuration,
    };

    try {
      await generateChallenge(params);
      router.push('/mission/briefing');
    } catch {}
  }

  return (
    <div className="space-y-5">
      {currentChallenge?.status === 'active' && (
        <TactileCard className="bg-[var(--accent-sky)] border-[var(--ink-forest)] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[var(--ink-forest)] text-white px-2 py-0.5 rounded">
              Mission in progress
            </span>
            <h2 className="text-lg font-bold text-[var(--ink-forest)] mt-2">{currentChallenge.title}</h2>
            <p className="text-sm text-[#245A75] line-clamp-2">{currentChallenge.objective}</p>
          </div>
          <TactileButton onClick={() => router.push('/mission/active')} className="shrink-0 whitespace-nowrap">
            Resume mission
          </TactileButton>
        </TactileCard>
      )}

      {user && (
        <TactileCard variant="sage" className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="section-sublabel">Welcome back</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink-forest)] truncate">
                Ready to get outside, {user.username}?
              </h1>
            </div>
            <div className="dashboard-level-badge" aria-label={`Level ${levelProgress.level}, ${levelProgress.totalXp} total XP`}>
              <span>Level</span>
              <strong>{levelProgress.level}</strong>
              <span>{levelProgress.totalXp} XP</span>
            </div>
          </div>
          <ProgressBar
            current={levelProgress.xpInCurrentLevel}
            max={levelProgress.xpNeededForNextLevel}
            label="Progress to next level"
          />
        </TactileCard>
      )}

      <TactileCard className="dashboard-builder-card p-4 sm:p-6 space-y-5">
        <header className="border-b-2 border-[var(--border-sand)] pb-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--primary-botanical)]">
            Mission builder
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink-forest)] mt-1">
            What would you like to do?
          </h2>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            Choose a vibe and how long you have. The AI will shape the mission.
          </p>
        </header>

        <section aria-labelledby="experience-heading">
          <div className="dashboard-section-heading">
            <h3 id="experience-heading">Choose a vibe</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id as ExperienceType)}
                className={`dashboard-category ${selectedCategory === category.id ? 'selected' : ''}`}
              >
                <span className="dashboard-category-icon" aria-hidden="true">
                  <CategoryIcon category={category.id} />
                </span>
                <span className="font-bold text-sm text-[var(--ink-forest)]">{category.name}</span>
                {selectedCategory === category.id && <span className="dashboard-selected-mark" aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="duration-heading">
          <div className="dashboard-section-heading">
            <h3 id="duration-heading">How much time do you have?</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DURATIONS.map((duration) => (
              <button
                key={duration.min}
                type="button"
                aria-pressed={selectedDuration === duration.min}
                onClick={() => setSelectedDuration(duration.min as DurationMinutes)}
                className={`dashboard-duration ${selectedDuration === duration.min ? 'selected' : ''}`}
              >
                <span className="dashboard-duration-number">{duration.min}</span>
                <span className="dashboard-duration-unit">minutes</span>
              </button>
            ))}
          </div>
        </section>

        <div className="pt-1">
          <TactileButton fullWidth loading={loading} onClick={handleGenerate} className="py-3 text-base">
            Generate my mission
          </TactileButton>
          <p className="mt-2 text-center text-xs text-[var(--ink-muted)]">
            Your phone can go away once the mission begins.
          </p>
        </div>
      </TactileCard>
    </div>
  );
}

function CategoryIcon({ category }: { category: CategoryId }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      {category === 'observe' && <><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>}
      {category === 'calm' && <><path d="M20 4c-7.6.2-13.1 2.7-14.5 8.1-.8 3 1 5.3 3.7 5.3C15 17.4 18.8 11.7 20 4Z" /><path d="M4 21c3.1-4.9 6.8-8.1 12.5-11.2" /></>}
      {category === 'discover' && <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5M10.5 7v7M7 10.5h7" /></>}
      {category === 'explore' && <><circle cx="12" cy="12" r="9" /><path d="m15.8 8.2-2.4 5.2-5.2 2.4 2.4-5.2 5.2-2.4Z" /></>}
      {category === 'active' && <><path d="m13 2-3 8h6l-5 12 1-9H6l7-11Z" /></>}
      {category === 'social' && <><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.5A5.5 5.5 0 019 13h1M16 11a3 3 0 100-6M15 14a5 5 0 015.5 5v1" /></>}
      {category === 'surprise' && <><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" /><circle cx="12" cy="12" r="9" /></>}
    </svg>
  );
}
