'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { LeaderboardEntry } from '@touch-grass/shared';
import { useGame } from '../../../context/GameContext';
import { TactileCard, TactileButton, TactilePill } from '../../../components/ui';
import { api, ApiError } from '../../../lib/api';

export default function SpacesPage() {
  const { spaces, loadSpaces, createSpace, joinSpace, user } = useGame();
  const [spaceName, setSpaceName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [openLeaderboard, setOpenLeaderboard] = useState<string | null>(null);
  const [spaceLeaderboards, setSpaceLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});
  const [leaderboardLoading, setLeaderboardLoading] = useState<string | null>(null);
  const [leaderboardErrors, setLeaderboardErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) loadSpaces();
  }, [user, loadSpaces]);

  async function handleCreate() {
    if (!spaceName.trim()) return;
    setCreating(true);
    try {
      await createSpace(spaceName.trim());
      setSpaceName('');
    } catch {}
    setCreating(false);
  }

  async function handleJoin() {
    if (!inviteCode.trim()) return;
    setJoining(true);
    try {
      await joinSpace(inviteCode.trim());
      setInviteCode('');
    } catch {}
    setJoining(false);
  }

  async function loadSpaceLeaderboard(spaceId: string, force = false) {
    setOpenLeaderboard(spaceId);
    setLeaderboardErrors((current) => {
      const next = { ...current };
      delete next[spaceId];
      return next;
    });
    if (!force && spaceLeaderboards[spaceId]) return;

    setLeaderboardLoading(spaceId);
    try {
      const { leaderboard } = await api.getSpaceLeaderboard(spaceId);
      setSpaceLeaderboards((current) => ({ ...current, [spaceId]: leaderboard }));
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : 'Could not load this Space leaderboard. Please try again.';
      setLeaderboardErrors((current) => ({ ...current, [spaceId]: message }));
    } finally {
      setLeaderboardLoading(null);
    }
  }

  function toggleLeaderboard(spaceId: string) {
    if (openLeaderboard === spaceId) {
      setOpenLeaderboard(null);
      return;
    }
    void loadSpaceLeaderboard(spaceId);
  }

  if (!user) {
    return (
      <TactileCard className="p-6 text-center animate-scale-in">
        <p className="text-[var(--ink-muted)]">Log in to view and manage Spaces.</p>
        <Link href="/login" className="tactile-btn-primary mt-4 inline-flex no-underline">
          Log In
        </Link>
      </TactileCard>
    );
  }

  return (
    <TactileCard className="space-y-6 p-5 sm:p-6">
      <div className="flex items-center justify-between border-b-2 border-[var(--border-sand)] pb-4 animate-fade-in">
        <div>
          <h2 className="text-2xl font-black text-[var(--ink-forest)]">Spaces · Friend Expeditions</h2>
          <p className="text-xs text-[var(--ink-muted)]">Create shared challenge rooms and compete asynchronously.</p>
        </div>
        <Link href="/dashboard" className="text-sm font-bold text-[var(--primary-botanical)] hover:underline no-underline">
          Close
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 animate-slide-up sm:grid-cols-2">
        <div className="space-y-3 rounded-xl border-2 border-[var(--ink-forest)] bg-[var(--canvas-base)] p-4">
          <h3 className="text-sm font-bold text-[var(--ink-forest)]">Create New Space</h3>
          <input
            type="text"
            placeholder="Space Name (e.g. Saturday Explorers)"
            value={spaceName}
            onChange={(event) => setSpaceName(event.target.value)}
            className="tactile-input text-xs"
          />
          <TactileButton fullWidth onClick={handleCreate} loading={creating} className="py-1.5 text-xs">
            Create Space
          </TactileButton>
        </div>

        <div className="space-y-3 rounded-xl border-2 border-[var(--ink-forest)] bg-[var(--canvas-base)] p-4">
          <h3 className="text-sm font-bold text-[var(--ink-forest)]">Join With Invite Code</h3>
          <input
            type="text"
            placeholder="Enter 6-character invite code"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
            className="tactile-input text-xs uppercase"
          />
          <TactileButton fullWidth variant="secondary" onClick={handleJoin} loading={joining} className="py-1.5 text-xs">
            Join Space
          </TactileButton>
        </div>
      </div>

      <div className="space-y-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <span className="section-sublabel">Your Active Spaces</span>
        {spaces.length === 0 ? (
          <p className="py-4 text-center text-xs italic text-[var(--ink-muted)]">
            You haven&apos;t joined any Spaces yet. Create one or enter an invite code above.
          </p>
        ) : (
          <div className="stagger-children space-y-2">
            {spaces.map((space) => (
              <div
                key={space.id}
                className="rounded-xl border-2 border-[var(--ink-forest)] bg-[var(--surface-sage)] p-3.5 transition-all hover:translate-y-[-1px] hover:shadow-[0_5px_0_var(--ink-forest)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--ink-forest)]">{space.name}</h4>
                    <span className="text-xs text-[var(--ink-muted)]">
                      Code: <span className="font-bold text-[var(--ink-forest)]">{space.inviteCode}</span> · {space.membersCount} Explorers
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TactilePill variant="gold" className="text-xs">Active</TactilePill>
                    <button
                      type="button"
                      onClick={() => toggleLeaderboard(space.id)}
                      aria-expanded={openLeaderboard === space.id}
                      aria-controls={`space-leaderboard-${space.id}`}
                      className="text-xs font-bold text-[var(--primary-botanical)] underline underline-offset-2"
                    >
                      {openLeaderboard === space.id ? 'Hide leaderboard' : 'View leaderboard'}
                    </button>
                  </div>
                </div>

                {openLeaderboard === space.id && (
                  <section id={`space-leaderboard-${space.id}`} aria-live="polite" className="mt-4 border-t border-[var(--border-sand)] pt-3">
                    <h5 className="mb-2 text-xs font-black uppercase tracking-wide text-[var(--ink-forest)]">Space leaderboard</h5>
                    {leaderboardLoading === space.id ? (
                      <p className="text-xs text-[var(--ink-muted)]">Loading rankings...</p>
                    ) : leaderboardErrors[space.id] ? (
                      <div>
                        <p role="alert" className="text-xs text-red-700">{leaderboardErrors[space.id]}</p>
                        <button
                          type="button"
                          onClick={() => void loadSpaceLeaderboard(space.id, true)}
                          className="mt-2 text-xs font-bold text-[var(--primary-botanical)] underline"
                        >
                          Try again
                        </button>
                      </div>
                    ) : (spaceLeaderboards[space.id]?.length ?? 0) === 0 ? (
                      <p className="text-xs text-[var(--ink-muted)]">No members to rank yet.</p>
                    ) : (
                      <ol className="space-y-2">
                        {spaceLeaderboards[space.id].map((player) => (
                          <li key={player.userId} className="flex items-center justify-between gap-3 rounded-lg bg-white/70 px-3 py-2 text-xs">
                            <span className="font-bold text-[var(--ink-forest)]">
                              #{player.rank} {player.username}{player.userId === user.id ? ' (you)' : ''}
                            </span>
                            <span className="shrink-0 text-[var(--ink-muted)]">{player.totalXp.toLocaleString()} XP</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </TactileCard>
  );
}
