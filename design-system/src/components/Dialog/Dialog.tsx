'use client';

import { useEffect, useRef } from 'react';
import type {
  DialogProps,
  DialogHeaderProps,
  DialogBodyProps,
  DialogFooterProps,
} from './Dialog.types';

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

function DialogRoot({
  open,
  onOpenChange,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  size = 'md',
  className = '',
  children,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
}: DialogProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, closeOnEscape, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const prevActive = document.activeElement as HTMLElement | null;
    contentRef.current?.focus();
    return () => {
      document.body.style.overflow = original;
      prevActive?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    >
      <div
        aria-hidden="true"
        onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
        className={[
          'absolute inset-0 bg-black/50',
          closeOnOverlayClick ? 'cursor-pointer' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      <div
        ref={contentRef}
        tabIndex={-1}
        className={[
          'relative z-10 w-full rounded-lg border border-border bg-background p-4 shadow-lg outline-none',
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </div>
  );
}

function DialogHeader({ children, className = '' }: DialogHeaderProps) {
  return (
    <div
      className={[
        'mb-3 flex items-start justify-between text-lg font-semibold text-foreground',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

function DialogBody({ children, className = '' }: DialogBodyProps) {
  return (
    <div className={['text-sm text-foreground', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

function DialogFooter({ children, className = '' }: DialogFooterProps) {
  return (
    <div
      className={['mt-4 flex justify-end gap-2', className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}

export const Dialog = Object.assign(DialogRoot, {
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
});
