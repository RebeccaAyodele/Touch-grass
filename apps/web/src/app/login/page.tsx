'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameProvider, useGame } from '../../context/GameContext';
import { TactileButton } from '../../components/ui';

function LoginForm() {
  const router = useRouter();
  const { login, register, loading, errorMsg, setError } = useGame();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (mode === 'register') {
        await register(form.username, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      router.push('/dashboard');
    } catch {}
  }

  function update(field: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
    if (errorMsg) setError(null);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--canvas-base)]">
      {/* Logo */}
      <div className="text-center mb-8 animate-slide-down">
        <div className="w-16 h-16 rounded-full bg-[var(--primary-botanical)] text-white text-3xl flex items-center justify-center mx-auto border-4 border-[var(--ink-forest)] shadow-[0_4px_0_var(--ink-forest)] mb-4">
          🌱
        </div>
        <h1 className="text-3xl font-black text-[var(--ink-forest)]">TOUCH GRASS</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1">Field Guide & Outdoor Game</p>
      </div>

      {/* Card */}
      <div className="tactile-card p-6 sm:p-8 w-full max-w-sm space-y-5 animate-scale-in">
        <div className="text-center">
          <h2 className="text-xl font-black text-[var(--ink-forest)]">
            {mode === 'register' ? 'Begin Your Expedition' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            {mode === 'register'
              ? 'Create an account to track XP, level up, and complete outdoor quests.'
              : 'Log in to continue your outdoor adventure.'}
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="animate-slide-down text-xs font-medium text-red-900 bg-[#FFDAD6] border border-red-400 rounded-lg p-3 flex justify-between">
            <span>⚠️ {errorMsg}</span>
            <button onClick={() => setError(null)} className="font-bold ml-2">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="section-label" htmlFor="username">Explorer Username</label>
              <input
                id="username"
                type="text"
                required
                value={form.username}
                onChange={(e) => update('username', e.target.value)}
                placeholder="e.g. FloraSeeker"
                className="tactile-input"
              />
            </div>
          )}

          <div>
            <label className="section-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="explorer@example.com"
              className="tactile-input"
            />
          </div>

          <div>
            <label className="section-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="••••••••"
              className="tactile-input"
            />
          </div>

          <TactileButton type="submit" loading={loading} fullWidth className="py-2.5 mt-2">
            {mode === 'register' ? '🌿 Register & Play' : '🚀 Log In'}
          </TactileButton>
        </form>

        <div className="text-center text-xs text-[var(--ink-muted)]">
          {mode === 'register' ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="font-bold text-[var(--primary-botanical)] underline"
              >
                Log in
              </button>
            </span>
          ) : (
            <span>
              New explorer?{' '}
              <button
                onClick={() => setMode('register')}
                className="font-bold text-[var(--primary-botanical)] underline"
              >
                Sign up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GameProvider>
      <LoginForm />
    </GameProvider>
  );
}
