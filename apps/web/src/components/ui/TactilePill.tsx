'use client';

import React from 'react';

type PillVariant = 'sage' | 'gold' | 'sky' | 'coral';

interface TactilePillProps {
  variant?: PillVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClass: Record<PillVariant, string> = {
  sage: 'pill-sage',
  gold: 'pill-gold',
  sky: 'pill-sky',
  coral: 'pill-coral',
};

export function TactilePill({
  variant = 'sage',
  className = '',
  children,
}: TactilePillProps) {
  return (
    <span className={`tactile-pill ${variantClass[variant]} ${className}`}>
      {children}
    </span>
  );
}
