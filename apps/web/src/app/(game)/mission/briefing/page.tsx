'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../../../../context/GameContext';
import { TactileButton } from '../../../../components/ui';

function sourceLabel(source: string) {
  if (source === 'model') return 'AI generated';
  if (source === 'mock') return 'Demo mission';
  return 'Curated mission';
}

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
    <article className="mission-briefing animate-slide-up">
      <header className="mission-briefing-hero">
        <div className="mission-briefing-topline">
          <span className="mission-briefing-kicker">Your field guide</span>
          <span className="mission-source" title={`Mission source: ${currentChallenge.source}`}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3.5c-4.8 0-8.5 3.7-8.5 8.5s3.7 8.5 8.5 8.5 8.5-3.7 8.5-8.5S16.8 3.5 12 3.5Z" stroke="currentColor" strokeWidth="1.7" />
              <path d="M7.5 13.5c3.8-.1 6.7-2.4 8.9-6.1.5 5.1-1.9 9.1-6.2 9.2-1.5 0-2.5-1.1-2.7-3.1Z" fill="currentColor" />
            </svg>
            {sourceLabel(currentChallenge.source)}
          </span>
        </div>

        <div className="mission-briefing-heading-row">
          <div>
            <div className="mission-meta-row">
              <span className="mission-meta-tag">{currentChallenge.experienceType}</span>
              <span className="mission-meta-tag mission-meta-tag-time">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
                {currentChallenge.durationMinutes} min
              </span>
            </div>
            <h1 className="mission-briefing-title">{currentChallenge.title}</h1>
          </div>
          <div className="mission-xp-card" aria-label={`${currentChallenge.baseXp} experience points, plus up to ${currentChallenge.maxBonusXp} bonus`}>
            <span>Mission reward</span>
            <strong>+{currentChallenge.baseXp} XP</strong>
            <small>up to +{currentChallenge.maxBonusXp} bonus</small>
          </div>
        </div>

        {currentChallenge.storyIntro && (
          <p className="mission-story">“{currentChallenge.storyIntro}”</p>
        )}
      </header>

      <div className="mission-briefing-content">
        <section className="mission-objective-panel">
          <span className="mission-section-label">The intention</span>
          <p>{currentChallenge.objective}</p>
        </section>

        <section className="mission-steps-section">
          <div className="mission-section-heading">
            <div>
              <span className="mission-section-label">Take it one step at a time</span>
              <h2>Your mission</h2>
            </div>
            <span className="mission-step-count">{currentChallenge.instructions.length} steps</span>
          </div>
          <ol className="mission-step-list">
            {currentChallenge.instructions.map((instruction: string, index: number) => (
              <li key={index}>
                <span className="mission-step-number">{String(index + 1).padStart(2, '0')}</span>
                <span>{instruction.replace(/^\d+[.)]\s*/, '')}</span>
              </li>
            ))}
          </ol>
        </section>

        {(currentChallenge.safetyNotes || currentChallenge.accessibilityAlternative) && (
          <aside className="mission-care-grid" aria-label="Helpful notes">
            {currentChallenge.safetyNotes && (
              <div className="mission-care-note mission-safety-note">
                <span className="mission-care-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 3 20 6v5.2c0 4.7-3.3 8-8 9.8-4.7-1.8-8-5.1-8-9.8V6l8-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="m8.5 12 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <div><strong>Stay safe</strong><p>{currentChallenge.safetyNotes}</p></div>
              </div>
            )}
            {currentChallenge.accessibilityAlternative && (
              <div className="mission-care-note mission-access-note">
                <span className="mission-care-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="4.5" r="1.8" stroke="currentColor" strokeWidth="1.7"/><path d="M5 8h14M12 8v5m0 0-4.5 7M12 13l4.5 7M8 11l4-3 4 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <div><strong>Make it work for you</strong><p>{currentChallenge.accessibilityAlternative}</p></div>
              </div>
            )}
          </aside>
        )}

        <footer className="mission-briefing-actions">
          <p className="mission-duration-note" role="note">
            Full XP requires the selected mission time to pass. If you submit earlier, your XP is reduced in proportion to the time elapsed. For example, submitting a 20-minute mission after 15 minutes earns 75% of its XP.
          </p>
          <div className="mission-phone-reminder">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6.5" y="3" width="11" height="18" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M10 6h4M11 18h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
            <span>Once you begin, your phone can take a break too.</span>
          </div>
          <div className="mission-action-buttons">
            <TactileButton onClick={handleStart} loading={loading} className="mission-start-button">
              Start mission
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </TactileButton>
            <TactileButton variant="secondary" onClick={() => router.push('/dashboard')} className="mission-back-button">
              Back to hub
            </TactileButton>
          </div>
        </footer>
      </div>
    </article>
  );
}
