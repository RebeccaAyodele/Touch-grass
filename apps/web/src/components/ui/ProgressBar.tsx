'use client';

import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showValues?: boolean;
  animate?: boolean;
  className?: string;
}

export function ProgressBar({
  current,
  max,
  label,
  showValues = true,
  animate = true,
  className = '',
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min((current / max) * 100, 100) : 0;

  return (
    <div className={className}>
      {(label || showValues) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="section-sublabel">{label}</span>
          )}
          {showValues && (
            <span className="text-xs font-extrabold text-[var(--ink-forest)]">
              {current} / {max} XP
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-white h-4 rounded-full border-2 border-[var(--ink-forest)] overflow-hidden p-0.5">
        <div
          className={`bg-[var(--primary-botanical)] h-full rounded-full transition-all duration-700 ease-out ${
            animate ? 'animate-progress-fill' : ''
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
