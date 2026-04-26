'use client';

import { createContext, useContext } from 'react';
import type { ChipProps, ChipIconProps, ChipRemoveProps } from './Chip.types';

interface ChipContextValue {
  disabled: boolean;
}

const ChipContext = createContext<ChipContextValue>({ disabled: false });

const variantStyles = {
  default: 'bg-muted text-muted-foreground border-border',
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  danger: 'bg-destructive/10 text-destructive border-destructive/20',
};

const selectedVariantStyles = {
  default: 'bg-foreground text-background border-foreground',
  primary: 'bg-primary text-white border-primary',
  success: 'bg-green-600 text-white border-green-600 dark:bg-green-500',
  warning: 'bg-yellow-500 text-white border-yellow-500',
  danger: 'bg-destructive text-destructive-foreground border-destructive',
};

const sizeStyles = {
  sm: 'text-xs h-6 px-2 gap-1',
  md: 'text-sm h-8 px-3 gap-1.5',
};

function ChipRoot({
  variant = 'default',
  size = 'md',
  selected = false,
  disabled = false,
  className = '',
  children,
  ...props
}: ChipProps) {
  return (
    <ChipContext.Provider value={{ disabled }}>
      <div
        data-selected={selected || undefined}
        data-disabled={disabled || undefined}
        className={[
          'inline-flex items-center rounded-full border font-medium transition-colors',
          selected ? selectedVariantStyles[variant] : variantStyles[variant],
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </div>
    </ChipContext.Provider>
  );
}

function ChipIcon({ children, className = '' }: ChipIconProps) {
  return (
    <span className={['inline-flex shrink-0 items-center', className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}

function ChipRemove({ className = '', disabled: disabledProp, ...props }: ChipRemoveProps) {
  const { disabled: contextDisabled } = useContext(ChipContext);
  const isDisabled = disabledProp ?? contextDisabled;

  return (
    <button
      type="button"
      aria-label="Remover"
      disabled={isDisabled}
      tabIndex={isDisabled ? -1 : undefined}
      className={[
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full size-4 -mr-0.5',
        'hover:bg-black/10 dark:hover:bg-white/10',
        'focus:outline-none focus:ring-1 focus:ring-ring',
        'disabled:pointer-events-none disabled:cursor-not-allowed',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <svg aria-hidden="true" viewBox="0 0 12 12" fill="currentColor" className="size-3">
        <path d="M6 4.586L9.293 1.293a1 1 0 011.414 1.414L7.414 6l3.293 3.293a1 1 0 01-1.414 1.414L6 7.414l-3.293 3.293a1 1 0 01-1.414-1.414L4.586 6 1.293 2.707A1 1 0 012.707 1.293L6 4.586z" />
      </svg>
    </button>
  );
}

export const Chip = Object.assign(ChipRoot, {
  Icon: ChipIcon,
  Remove: ChipRemove,
});
