'use client';

import React from 'react';

interface ErrorAlertProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <div className="animate-slide-down tactile-card bg-[#FFDAD6] border-red-800 p-3 mb-4 text-red-950 text-sm font-medium flex justify-between items-center gap-3">
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="font-bold text-red-800 hover:text-red-950 shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-200 transition-colors"
        aria-label="Dismiss error"
      >
        ✕
      </button>
    </div>
  );
}
