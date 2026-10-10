'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'yellow' | 'ghost';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'tactile-btn-primary',
  secondary: 'tactile-btn-secondary',
  yellow: 'tactile-btn-yellow',
  ghost: 'tactile-btn-ghost',
};

export function TactileButton({
  variant = 'primary',
  fullWidth = false,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: TactileButtonProps) {
  return (
    <button
      className={`${variantClass[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-pulse-glow">⏳</span>
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
