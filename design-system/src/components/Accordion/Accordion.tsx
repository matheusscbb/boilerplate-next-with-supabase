'use client';

import { useState } from 'react';
import type { AccordionProps, AccordionItemProps } from './Accordion.types';

function AccordionRoot({ children, className = '', ...props }: AccordionProps) {
  return (
    <div
      className={[
        'divide-y divide-border rounded-lg border border-border',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

function Item({
  title,
  children,
  defaultOpen = false,
  className = '',
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={className || undefined}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span>{title}</span>
        <span
          aria-hidden="true"
          className={[
            'inline-block text-muted-foreground transition-transform duration-200',
            open ? 'rotate-180' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="px-4 py-3 text-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

export const Accordion = Object.assign(AccordionRoot, { Item });
