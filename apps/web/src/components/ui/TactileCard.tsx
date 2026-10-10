'use client';

import React from 'react';

type CardVariant = 'default' | 'sage' | 'flat';

interface TactileCardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  animate?: boolean;
  onClick?: () => void;
}

const variantClass: Record<CardVariant, string> = {
  default: 'tactile-card',
  sage: 'tactile-card-sage',
  flat: 'tactile-card-flat',
};

export function TactileCard({
  variant = 'default',
  className = '',
  children,
  animate = true,
  onClick,
}: TactileCardProps) {
  return (
    <div
      className={`${variantClass[variant]} ${animate ? 'animate-slide-up' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
