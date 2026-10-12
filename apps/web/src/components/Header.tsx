'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useGame } from '../context/GameContext';

export function Header() {
  const { user, logout } = useGame();
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: '/spaces', label: 'Spaces' },
    { href: '/leaderboard', label: 'Ranks' },
  ];

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <header className="site-header tactile-card p-4 mb-6 flex flex-wrap items-center justify-between gap-3 animate-slide-down">
      <Link href="/dashboard" className="site-brand flex items-center gap-3 no-underline group">
        <div className="w-10 h-10 rounded-xl bg-[var(--primary-botanical)] text-white flex items-center justify-center font-bold text-xl border-2 border-[var(--ink-forest)] group-hover:scale-110 transition-transform">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
            <path d="M19.5 3.5C12.2 3.7 7 6.1 5.8 11.3c-.7 2.8.9 4.9 3.4 4.9 5.5 0 9-5.5 10.3-12.7Z" fill="#F7D76B" />
            <path d="M4 21c2.8-4.5 6.3-7.4 11.5-10.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-black text-[var(--ink-forest)] tracking-tight leading-none">TOUCH GRASS</h1>
          <span className="text-[10px] sm:text-xs text-[var(--ink-muted)] font-medium">Field Guide &amp; Outdoor Game</span>
        </div>
      </Link>

      {user ? (
        <nav aria-label="Main navigation" className="site-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={`site-nav-link ${pathname === link.href ? 'is-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/profile"
            aria-current={pathname === '/profile' ? 'page' : undefined}
            className={`site-nav-profile ${pathname === '/profile' ? 'is-active' : ''}`}
          >
            <span className="site-nav-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.3" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5.5 20c.6-3.4 3-5.2 6.5-5.2s5.9 1.8 6.5 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span>{user.username}</span>
          </Link>

          <button type="button" onClick={handleLogout} className="site-nav-logout">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M10 4H5.5A1.5 1.5 0 004 5.5v13A1.5 1.5 0 005.5 20H10M14 8l4 4-4 4m4-4H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Log out</span>
          </button>
        </nav>
      ) : (
        <Link href="/login" className="site-nav-guest tactile-btn-primary py-1.5 px-4 text-sm no-underline">
          Start Expedition â†’
        </Link>
      )}
    </header>
  );
}
