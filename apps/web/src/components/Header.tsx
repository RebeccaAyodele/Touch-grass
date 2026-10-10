'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGame } from '../context/GameContext';
import { TactilePill } from './ui';

export function Header() {
  const { user, levelProgress, logout } = useGame();
  const pathname = usePathname();

  const navLinks = [
    { href: '/spaces', label: '🏕️ Spaces', auth: true },
    { href: '/leaderboard', label: '🏆 Ranks', auth: true },
  ];

  return (
    <header className="tactile-card p-4 mb-6 flex flex-wrap items-center justify-between gap-3 bg-white animate-slide-down">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 no-underline group">
        <div className="w-10 h-10 rounded-full bg-[var(--primary-botanical)] text-white flex items-center justify-center font-bold text-xl border-2 border-[var(--ink-forest)] group-hover:scale-110 transition-transform">
          🌱
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-black text-[var(--ink-forest)] tracking-tight leading-none">
            TOUCH GRASS
          </h1>
          <span className="text-[10px] sm:text-xs text-[var(--ink-muted)] font-medium">
            Field Guide & Outdoor Game
          </span>
        </div>
      </Link>

      {/* Right side */}
      {user ? (
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
          <TactilePill variant="sage" className="text-xs">
            🎖️ Lvl {levelProgress.level}
          </TactilePill>
          <TactilePill variant="gold" className="text-xs">
            ✨ {levelProgress.totalXp} XP
          </TactilePill>
          <TactilePill variant="sky" className="text-xs hidden sm:inline-flex">
            🔥 {user.streak}d
          </TactilePill>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs font-bold px-2.5 py-1 rounded-md border transition-colors no-underline ${
                pathname === link.href
                  ? 'border-[var(--ink-forest)] bg-[var(--surface-sage)] text-[var(--ink-forest)]'
                  : 'border-[var(--border-sand)] text-[var(--ink-forest)] hover:border-[var(--ink-forest)] hover:bg-[var(--surface-pale-sage)]'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={logout}
            className="text-xs text-red-700 hover:text-red-900 hover:underline ml-1 transition-colors"
          >
            Exit
          </button>
        </div>
      ) : (
        <Link href="/login" className="tactile-btn-primary py-1.5 px-4 text-sm no-underline">
          Start Expedition →
        </Link>
      )}
    </header>
  );
}
