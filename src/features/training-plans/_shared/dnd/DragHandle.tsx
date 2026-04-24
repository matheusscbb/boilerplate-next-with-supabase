'use client';

import type { HTMLAttributes } from 'react';

interface GripIconProps {
  className?: string;
}

function GripIcon({ className = '' }: GripIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

export interface DragHandleProps {
  /** Spread of `attributes + listeners` coming from `useSortable`. */
  handleProps?: HTMLAttributes<HTMLButtonElement>;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Generic grip button used by sortable rows.
 *
 * - Stops pointer/click propagation so adjacent inputs don't steal focus.
 * - Honours `touch-action: none` so touch drag works reliably.
 * - Styled as a neutral muted button — sizes are controlled by the `size` prop.
 */
export function DragHandle({
  handleProps,
  label = 'Arrastar para reordenar',
  size = 'md',
  className = '',
}: DragHandleProps) {
  const sizeClasses =
    size === 'sm' ? 'h-7 w-7 [&_svg]:h-3.5 [&_svg]:w-3.5' : 'h-8 w-8';

  return (
    <button
      type="button"
      aria-label={label}
      {...handleProps}
      onPointerDown={(e) => {
        e.stopPropagation();
        handleProps?.onPointerDown?.(e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleProps?.onClick?.(e);
      }}
      className={[
        'flex shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-md',
        'text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing',
        sizeClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <GripIcon className="h-4 w-4" />
    </button>
  );
}
