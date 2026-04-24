'use client';

import type { TextareaProps } from './Textarea.types';

const resizeStyles = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
};

export function Textarea({
  ref,
  error,
  resize = 'vertical',
  rows = 3,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={[
        'w-full px-4 py-2 rounded-md border bg-transparent text-foreground placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        resizeStyles[resize],
        error ? 'border-destructive focus:ring-destructive' : 'border-border',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}
