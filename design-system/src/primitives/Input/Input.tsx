'use client';

import type { InputProps } from './Input.types';

export function Input({ ref, error, className = '', ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={[
        'h-10 w-full px-4 py-2 rounded-md border bg-transparent text-foreground placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error && 'border-destructive focus:ring-destructive',
        !error && 'border-border',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}
