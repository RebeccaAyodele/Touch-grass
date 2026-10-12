'use client';

import React, { useEffect, useState } from 'react';
import { GameProvider, useGame } from '../../context/GameContext';
import { Header } from '../../components/Header';
import { ErrorAlert } from '../../components/ui';

function GameLayoutInner({ children }: { children: React.ReactNode }) {
  const { errorMsg, setError, isAuthChecked } = useGame();
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    const notice = sessionStorage.getItem('touch_grass_auth_notice');
    if (!notice) return;

    sessionStorage.removeItem('touch_grass_auth_notice');
    setSuccessNotice(notice);
    const timeoutId = window.setTimeout(() => setSuccessNotice(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-pulse-glow">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mx-auto mb-3 h-10 w-10 text-[var(--primary-botanical)]">
            <path d="M19.5 3.5C12.2 3.7 7 6.1 5.8 11.3c-.7 2.8.9 4.9 3.4 4.9 5.5 0 9-5.5 10.3-12.7Z" fill="currentColor" />
            <path d="M4 21c2.8-4.5 6.3-7.4 11.5-10.2" stroke="#FFF9EF" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-bold text-[var(--ink-muted)]">Loading expedition...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-4 py-4 sm:py-6">
      <Header />
      {successNotice && (
        <div role="status" className="auth-success mb-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold">
          <span>{successNotice}</span>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            aria-label="Dismiss success message"
            className="shrink-0 font-bold"
          >
            ✕
          </button>
        </div>
      )}
      {errorMsg && <ErrorAlert message={errorMsg} onDismiss={() => setError(null)} />}
      <main className="flex-1">
        {children}
      </main>
      <footer className="text-center py-6 mt-8">
        <p className="text-xs text-[var(--ink-muted)]">
          Touch Grass · AI-Powered Outdoor Challenges · Built with Gemma 2
        </p>
      </footer>
    </div>
  );
}

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameProvider>
      <GameLayoutInner>{children}</GameLayoutInner>
    </GameProvider>
  );
}
