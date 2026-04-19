'use client';

import { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';

const variantStyles = {
  primary:
    'bg-primary text-white hover:opacity-90 focus:ring-2 focus:ring-ring focus:ring-offset-2',
  secondary:
    'bg-secondary text-white hover:opacity-90 focus:ring-2 focus:ring-ring focus:ring-offset-2',
  ghost: 'bg-transparent hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2',
  danger:
    'bg-destructive text-destructive-foreground hover:opacity-90 focus:ring-2 focus:ring-destructive focus:ring-offset-2',
};

const sizeStyles = {
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-10 px-4 text-sm rounded-md',
  lg: 'h-12 px-6 text-base rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled ?? isLoading}
        className={[
          'inline-flex items-center justify-center font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
