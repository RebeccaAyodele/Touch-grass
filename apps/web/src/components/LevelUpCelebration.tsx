'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface ConfettiParticle {
  id: number;
  left: number;
  color: string;
  delay: number;
  size: number;
}

const CONFETTI_COLORS = [
  '#F7D76B', // gold
  '#34784A', // botanical
  '#B9E4F5', // sky
  '#E98B73', // coral
  '#E4EEDF', // sage
  '#72A875', // leaf
];

interface LevelUpCelebrationProps {
  newLevel: number;
  onComplete?: () => void;
}

export function LevelUpCelebration({ newLevel, onComplete }: LevelUpCelebrationProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [visible, setVisible] = useState(true);

  const generateParticles = useCallback(() => {
    const newParticles: ConfettiParticle[] = [];
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.8,
        size: 6 + Math.random() * 8,
      });
    }
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    generateParticles();
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3500);
    return () => clearTimeout(timer);
  }, [generateParticles, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Confetti particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}

      {/* Center badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <div className="animate-level-up tactile-card bg-[var(--accent-gold)] p-8 text-center max-w-xs">
          <div className="animate-celebration text-5xl mb-3">⭐</div>
          <h2 className="text-2xl font-black text-[var(--ink-forest)]">LEVEL UP!</h2>
          <p className="text-4xl font-black text-[var(--ink-forest)] mt-1">Level {newLevel}</p>
          <p className="text-sm text-[var(--ink-forest)] mt-2 opacity-80">
            Your expedition rank has increased!
          </p>
        </div>
      </div>
    </div>
  );
}
