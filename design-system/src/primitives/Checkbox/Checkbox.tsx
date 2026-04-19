'use client';

import type { CheckboxProps } from './Checkbox.types';

const sizeStyles = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
};

const labelSizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Checkbox({ ref, label, error, size = 'md', className = '', id, ...props }: CheckboxProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className={[
          'flex items-center gap-2 cursor-pointer',
          props.disabled && 'cursor-not-allowed opacity-50',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={[
            'rounded border border-border bg-transparent text-primary',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed',
            error && 'border-destructive focus:ring-destructive',
            sizeStyles[size],
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {label && (
          <span className={['text-foreground select-none', labelSizeStyles[size]].join(' ')}>
            {label}
          </span>
        )}
      </label>
      {error && (
        <span className="text-sm text-destructive">{error}</span>
      )}
    </div>
  );
}
