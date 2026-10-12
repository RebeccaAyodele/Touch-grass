'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameProvider, useGame } from '../../context/GameContext';
import { TactileButton } from '../../components/ui';

function LoginForm() {
  const router = useRouter();
  const { login, register, loading, errorMsg, setError } = useGame();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get('mode');
    if (requestedMode === 'login' || requestedMode === 'register') setMode(requestedMode);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (mode === 'register') {
        await register(form.username, form.email, form.password, form.confirmPassword);
        sessionStorage.setItem(
          'touch_grass_auth_notice',
          `Account created successfully. Welcome, ${form.username.trim()}!`
        );
      } else {
        await login(form.email, form.password);
        sessionStorage.setItem('touch_grass_auth_notice', 'Welcome back!');
      }
      router.push('/dashboard');
    } catch {}
  }

  function update(field: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
    if (errorMsg) setError(null);
  }

  function changeMode(nextMode: 'login' | 'register') {
    setMode(nextMode);
    setError(null);
  }

  return (
    <main className="auth-page min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="auth-shell w-full max-w-md animate-scale-in">
        <header className="text-center mb-7 animate-slide-down">
          <div className="auth-brand-mark mx-auto mb-4" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" className="h-8 w-8">
              <path d="M31.5 8.5C20.2 8.7 12 12.4 10 20.1c-1.1 4.2 1.3 7.5 5.2 7.5 8.1 0 13.5-8.2 16.3-19.1Z" fill="#F7D76B" />
              <path d="M8 32c4.7-7.3 10.5-11.8 18.8-16" stroke="#FFF9EF" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="auth-eyebrow mb-1">A little more outside</p>
          <h1 className="auth-brand-title text-4xl font-extrabold text-[var(--ink-forest)]">Touch Grass</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-1">The phone is the scoreboard. The game happens outside.</p>
        </header>

        <section className="auth-card tactile-card p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="auth-heading text-2xl font-extrabold text-[var(--ink-forest)]">
              {mode === 'register' ? 'Begin Your Expedition' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1.5">
              {mode === 'register'
                ? 'Create an account and get your next outdoor quest.'
                : 'Sign in to pick up where your adventure left off.'}
            </p>
          </div>

          <div className="auth-mode-switch" role="group" aria-label="Choose an account action">
            <button
              type="button"
              aria-pressed={mode === 'register'}
              className={mode === 'register' ? 'auth-mode-option is-active' : 'auth-mode-option'}
              onClick={() => changeMode('register')}
            >
              Create account
            </button>
            <button
              type="button"
              aria-pressed={mode === 'login'}
              className={mode === 'login' ? 'auth-mode-option is-active' : 'auth-mode-option'}
              onClick={() => changeMode('login')}
            >
              Sign in
            </button>
          </div>

        {/* Error */}
        {errorMsg && (
          <div role="alert" className="auth-error animate-slide-down text-sm font-medium text-red-900 bg-[#FFDAD6] border border-red-400 rounded-lg p-3 flex justify-between gap-3">
            <span>{errorMsg}</span>
            <button type="button" onClick={() => setError(null)} className="font-bold shrink-0" aria-label="Dismiss error">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                maxLength={30}
                value={form.username}
                onChange={(e) => update('username', e.target.value)}
                placeholder="Choose a username"
                className="auth-field-input"
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-field-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="you@example.com"
              className="auth-field-input"
            />
          </div>

          <div className="auth-field">
            <label className="auth-field-label" htmlFor="password">Password</label>
            <div className="auth-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="Enter your password"
                className="auth-field-input has-visibility-toggle"
              />
              <button
                type="button"
                className="auth-visibility-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                <VisibilityIcon visible={showPassword} />
              </button>
            </div>
            {mode === 'register' && <p className="auth-field-hint">Use at least 8 characters.</p>}
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="confirmPassword">Confirm password</label>
              <div className="auth-password-wrap">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  placeholder="Enter your password again"
                  className="auth-field-input has-visibility-toggle"
                />
                <button
                  type="button"
                  className="auth-visibility-toggle"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                  aria-pressed={showConfirmPassword}
                >
                  <VisibilityIcon visible={showConfirmPassword} />
                </button>
              </div>
            </div>
          )}

          <TactileButton type="submit" loading={loading} fullWidth className="auth-submit mt-1">
            {mode === 'register' ? 'Create my account' : 'Sign in'}
          </TactileButton>
        </form>

          <p className="text-center text-xs text-[var(--ink-muted)]">
            Your next good day starts just outside.
          </p>
        </section>
      </div>
    </main>
  );
}

function VisibilityIcon({ visible }: { visible: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      {visible ? (
        <>
          <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.5 4.3 9.5 6.1a1.7 1.7 0 010 1.8 13.2 13.2 0 01-3.2 3.6M6.2 6.3A14 14 0 002.5 11a1.7 1.7 0 000 2c1 1.8 4.3 6 9.5 6 1.1 0 2.1-.2 3-.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        </>
      )}
    </svg>
  );
}

export default function LoginPage() {
  return (
    <GameProvider>
      <LoginForm />
    </GameProvider>
  );
}
