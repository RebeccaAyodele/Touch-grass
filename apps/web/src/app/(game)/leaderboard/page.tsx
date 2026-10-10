'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useGame } from '../../../context/GameContext';
import { TactileCard } from '../../../components/ui';

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardPage() {
  const { leaderboard, loadLeaderboard, user } = useGame();

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <TactileCard className="p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-[var(--border-sand)] pb-4 animate-fade-in">
        <div>
          <h2 className="text-2xl font-black text-[var(--ink-forest)]">Global Explorers Leaderboard</h2>
          <p className="text-xs text-[var(--ink-muted)]">
            Rankings calculated deterministically from verified completions.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-bold text-[var(--primary-botanical)] hover:underline no-underline"
        >
          ✕ Close
        </Link>
      </div>

      {/* Table */}
      <div className="space-y-2 stagger-children">
        {leaderboard.length === 0 ? (
          <p className="text-xs text-[var(--ink-muted)] italic py-6 text-center">
            No player rankings recorded yet. Complete a mission to appear here!
          </p>
        ) : (
          leaderboard.map((player) => {
            const isMe = user?.id === player.userId;
            const medal = RANK_MEDALS[player.rank];
            return (
              <div
                key={player.userId}
                className={`p-3.5 rounded-xl border-2 flex items-center justify-between transition-all ${
                  isMe
                    ? 'border-[var(--ink-forest)] bg-[var(--accent-gold)] shadow-[0_3px_0_var(--ink-forest)]'
                    : 'border-[var(--border-sand)] bg-white hover:border-[var(--ink-forest)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-base w-8 text-center text-[var(--ink-forest)]">
                    {medal ?? `#${player.rank}`}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-[var(--ink-forest)] flex items-center gap-1.5">
                      {player.username}
                      {isMe && (
                        <span className="text-[10px] font-extrabold uppercase bg-[var(--ink-forest)] text-white px-1.5 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--ink-muted)]">{player.touchGrassId}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm text-[var(--primary-botanical)]">
                    {player.totalXp.toLocaleString()} XP
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)]">Lvl {player.level}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </TactileCard>
  );
}
