'use client';

import type { SelectProps } from './Select.types';

export function Select({ ref, error, className = '', children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={[
          'block w-full appearance-none rounded-md border bg-background',
          'px-3 py-2 pr-8 text-sm text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-destructive focus:ring-destructive'
            : 'border-border focus:ring-ring',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </select>
      <div
        className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
