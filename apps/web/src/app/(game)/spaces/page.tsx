'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGame } from '../../../context/GameContext';
import { TactileCard, TactileButton, TactilePill } from '../../../components/ui';

export default function SpacesPage() {
  const { spaces, loadSpaces, createSpace, joinSpace, user } = useGame();
  const [spaceName, setSpaceName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

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
    <TactileCard className="p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-[var(--border-sand)] pb-4 animate-fade-in">
        <div>
          <h2 className="text-2xl font-black text-[var(--ink-forest)]">Spaces · Friend Expeditions</h2>
          <p className="text-xs text-[var(--ink-muted)]">Create shared challenge rooms and compete asynchronously.</p>
        </div>
        <Link href="/dashboard" className="text-sm font-bold text-[var(--primary-botanical)] hover:underline no-underline">
          ✕ Close
        </Link>
      </div>

      {/* Create & Join */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
        <div className="bg-[var(--canvas-base)] p-4 rounded-xl border-2 border-[var(--ink-forest)] space-y-3">
          <h3 className="font-bold text-sm text-[var(--ink-forest)]">Create New Space</h3>
          <input
            type="text"
            placeholder="Space Name (e.g. Saturday Explorers)"
            value={spaceName}
            onChange={(e) => setSpaceName(e.target.value)}
            className="tactile-input text-xs"
          />
          <TactileButton fullWidth onClick={handleCreate} loading={creating} className="py-1.5 text-xs">
            Create Space
          </TactileButton>
        </div>

        <div className="bg-[var(--canvas-base)] p-4 rounded-xl border-2 border-[var(--ink-forest)] space-y-3">
          <h3 className="font-bold text-sm text-[var(--ink-forest)]">Join With Invite Code</h3>
          <input
            type="text"
            placeholder="Enter 6-char Invite Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="tactile-input text-xs uppercase"
          />
          <TactileButton fullWidth variant="secondary" onClick={handleJoin} loading={joining} className="py-1.5 text-xs">
            Join Space
          </TactileButton>
        </div>
      </div>

      {/* Spaces List */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <span className="section-sublabel">Your Active Spaces</span>
        {spaces.length === 0 ? (
          <p className="text-xs text-[var(--ink-muted)] italic py-4 text-center">
            You haven&apos;t joined any Spaces yet. Create one or enter an invite code above.
          </p>
        ) : (
          <div className="stagger-children space-y-2">
            {spaces.map((sp) => (
              <div
                key={sp.id}
                className="p-3.5 rounded-xl border-2 border-[var(--ink-forest)] bg-[var(--surface-sage)] flex justify-between items-center transition-all hover:translate-y-[-1px] hover:shadow-[0_5px_0_var(--ink-forest)]"
              >
                <div>
                  <h4 className="font-bold text-sm text-[var(--ink-forest)]">{sp.name}</h4>
                  <span className="text-xs text-[var(--ink-muted)]">
                    Code: <span className="font-bold text-[var(--ink-forest)]">{sp.inviteCode}</span> · {sp.membersCount} Explorers
                  </span>
                </div>
                <TactilePill variant="gold" className="text-xs">Active</TactilePill>
              </div>
            ))}
          </div>
        )}
      </div>
    </TactileCard>
  );
}
