'use client';

import React from 'react';
import { GameProvider, useGame } from '../../context/GameContext';
import { Header } from '../../components/Header';
import { ErrorAlert } from '../../components/ui';

function GameLayoutInner({ children }: { children: React.ReactNode }) {
  const { errorMsg, setError, isAuthChecked } = useGame();

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-pulse-glow">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-sm font-bold text-[var(--ink-muted)]">Loading expedition...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-4 py-4 sm:py-6">
      <Header />
      {errorMsg && <ErrorAlert message={errorMsg} onDismiss={() => setError(null)} />}
      <main className="flex-1">
        {children}
      </main>
      <footer className="text-center py-6 mt-8">
        <p className="text-xs text-[var(--ink-muted)]">
          Touch Grass · AI-Powered Outdoor Challenges · Built with Gemma 2 🌿
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
