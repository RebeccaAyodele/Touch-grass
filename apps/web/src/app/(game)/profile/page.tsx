'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGame } from '../../../context/GameContext';
import { api } from '../../../lib/api';
import { ProgressBar, TactileCard } from '../../../components/ui';

export default function ProfilePage() {
  const { user, levelProgress } = useGame();
  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.getMyProfile()
      .then(({ stats }) => {
        if (active) setCompletedCount(stats.completedCount);
      })
      .catch(() => {
        if (active) setProfileError('Your profile stats could not be loaded. Please refresh to try again.');
      });
    return () => { active = false; };
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-5 animate-fade-in">
      <TactileCard variant="sage" className="profile-hero p-5 sm:p-7">
        <div className="profile-identity">
          <span className="profile-avatar" aria-hidden="true">{user.username.charAt(0).toUpperCase()}</span>
          <div className="min-w-0">
            <span className="section-sublabel">Your explorer profile</span>
            <h1 className="profile-name">{user.username}</h1>
            <p className="profile-id">Touch Grass ID: {user.touchGrassId}</p>
          </div>
        </div>
        <div className="profile-level-pill">Level {levelProgress.level}</div>
        <ProgressBar
          current={levelProgress.xpInCurrentLevel}
          max={levelProgress.xpNeededForNextLevel}
          label="Progress to next level"
        />
      </TactileCard>

      <section className="profile-stat-grid" aria-label="Your game stats">
        <TactileCard className="profile-stat-card">
          <span className="profile-stat-label">Total experience</span>
          <strong>{user.totalXp.toLocaleString()} XP</strong>
        </TactileCard>
        <TactileCard className="profile-stat-card">
          <span className="profile-stat-label">Missions completed</span>
          <strong>{completedCount === null ? '—' : completedCount}</strong>
        </TactileCard>
        <TactileCard className="profile-stat-card">
          <span className="profile-stat-label">Current streak</span>
          <strong>{user.streak} days</strong>
        </TactileCard>
      </section>

      {profileError && <p className="profile-error" role="status">{profileError}</p>}

      <TactileCard className="profile-details-card">
        <div>
          <span className="profile-stat-label">Email</span>
          <p>{user.email}</p>
        </div>
        <div>
          <span className="profile-stat-label">Explorer since</span>
          <p>{user.createdAt.slice(0, 10)}</p>
        </div>
        <div className="profile-shortcuts">
          <Link href="/spaces">Visit your Spaces</Link>
          <Link href="/leaderboard">View the rankings</Link>
        </div>
      </TactileCard>
    </div>
  );
}
