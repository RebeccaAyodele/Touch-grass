'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExperienceType, DurationMinutes } from '@touch-grass/shared';
import { useGame } from '../../../context/GameContext';
import { TactileCard, TactileButton, TactilePill, ProgressBar } from '../../../components/ui';

const CATEGORIES = [
  { id: 'observe', emoji: '👀', name: 'Observe', desc: 'Notice details hidden in plain sight' },
  { id: 'calm', emoji: '🌿', name: 'Calm', desc: 'Mindful pause, listening & stillness' },
  { id: 'discover', emoji: '📸', name: 'Discover', desc: 'Botanical & texture foraging' },
  { id: 'explore', emoji: '🧭', name: 'Explore', desc: 'New perspective on familiar space' },
  { id: 'active', emoji: '🏃', name: 'Active', desc: 'Movement & perimeter circuit' },
  { id: 'social', emoji: '👥', name: 'Social', desc: 'Partner discovery with a friend' },
  { id: 'surprise', emoji: '🎲', name: 'Surprise', desc: 'Spontaneous creative mission' },
] as const;

const DURATIONS = [
  { min: 10, base: 200, label: '10 min', sublabel: 'Quick' },
  { min: 20, base: 350, label: '20 min', sublabel: 'Standard' },
  { min: 30, base: 500, label: '30 min', sublabel: 'Deep' },
  { min: 60, base: 750, label: '60 min', sublabel: 'Expedition' },
] as const;

const SETTINGS = [
  { id: 'garden_or_yard', label: '🏡 Garden / Backyard' },
  { id: 'balcony_or_patio', label: '🪴 Balcony / Porch' },
  { id: 'park', label: '🌲 Park / Green Trail' },
  { id: 'urban_street', label: '🏙️ Walkway / Street' },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    currentChallenge,
    levelProgress,
    loading,
    generateChallenge,
  } = useGame();

  const [selectedCategory, setSelectedCategory] = useState<ExperienceType>('observe');
  const [selectedDuration, setSelectedDuration] = useState<DurationMinutes>(20);
  const [selectedSetting, setSelectedSetting] = useState('garden_or_yard');

  async function handleGenerate() {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await generateChallenge({
        experienceType: selectedCategory,
        durationMinutes: selectedDuration,
      });
      router.push('/mission/briefing');
    } catch {}
  }

  return (
    <div className="space-y-6 stagger-children">
      {/* Active Mission Banner */}
      {currentChallenge && currentChallenge.status === 'active' && (
        <TactileCard className="bg-[var(--accent-sky)] border-[var(--ink-forest)] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[var(--ink-forest)] text-white px-2 py-0.5 rounded">
              Active Mission in Progress
            </span>
            <h3 className="text-lg font-bold text-[var(--ink-forest)] mt-1">{currentChallenge.title}</h3>
            <p className="text-sm text-[#245A75]">{currentChallenge.objective}</p>
          </div>
          <TactileButton onClick={() => router.push('/mission/active')} className="whitespace-nowrap">
            Resume 📵
          </TactileButton>
        </TactileCard>
      )}

      {/* Player Level Progress */}
      {user && (
        <TactileCard variant="sage" className="p-5 space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <span className="section-sublabel">Expedition Rank</span>
              <h2 className="text-xl font-extrabold text-[var(--ink-forest)]">
                {user.username}{' '}
                <span className="text-sm font-normal text-[var(--ink-muted)]">({user.touchGrassId})</span>
              </h2>
            </div>
            <TactilePill variant="gold" className="text-sm">
              🎖️ Level {levelProgress.level}
            </TactilePill>
          </div>
          <ProgressBar
            current={levelProgress.xpInCurrentLevel}
            max={levelProgress.xpNeededForNextLevel}
            label="Level Progress"
          />
        </TactileCard>
      )}

      {/* Mission Generator */}
      <TactileCard className="p-5 sm:p-6 space-y-6">
        <div className="border-b-2 border-[var(--border-sand)] pb-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--primary-botanical)]">
            AI Game Master · Mission Generator
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--ink-forest)] mt-1">
            What do you feel like exploring today?
          </h2>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            Choose your vibe, put your phone away, and explore the real world.
          </p>
        </div>

        {/* Category Grid */}
        <div>
          <span className="section-label">1. Experience Theme</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 stagger-children">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as ExperienceType)}
                className={`selection-chip ${selectedCategory === cat.id ? 'selected' : ''}`}
              >
                <div className="text-xl mb-1">{cat.emoji}</div>
                <div className="font-bold text-sm text-[var(--ink-forest)]">{cat.name}</div>
                <div className="text-[11px] text-[var(--ink-muted)] line-clamp-2">{cat.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <span className="section-label">2. Available Time Outdoors</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DURATIONS.map((dur) => (
              <button
                key={dur.min}
                onClick={() => setSelectedDuration(dur.min as DurationMinutes)}
                className={`selection-chip text-center ${
                  selectedDuration === dur.min ? 'selection-chip-gold selected' : ''
                }`}
              >
                <div className="text-sm text-[var(--ink-forest)] font-bold">{dur.label}</div>
                <div className="text-[11px] text-[var(--ink-muted)]">{dur.sublabel}</div>
                <div className="text-xs text-[var(--primary-botanical)] font-bold mt-0.5">+{dur.base} XP</div>
              </button>
            ))}
          </div>
        </div>

        {/* Setting */}
        <div>
          <span className="section-label">3. Your Location Setting</span>
          <div className="flex flex-wrap gap-2">
            {SETTINGS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSetting(s.id)}
                className={`location-pill ${selectedSetting === s.id ? 'selected' : ''}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2">
          <TactileButton
            fullWidth
            loading={loading}
            onClick={handleGenerate}
            className="py-3.5 text-base"
          >
            ✨ Generate Real-World Outdoor Mission
          </TactileButton>
        </div>
      </TactileCard>
    </div>
  );
}
