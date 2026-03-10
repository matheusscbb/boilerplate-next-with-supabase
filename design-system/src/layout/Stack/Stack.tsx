'use client';

import type { HTMLAttributes } from 'react';

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'vertical' | 'horizontal';
  gap?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const gapMap = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function Stack({
  direction = 'vertical',
  gap = 'md',
  children,
  className = '',
  ...props
}: StackProps) {
  return (
    <div
      className={[
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        gapMap[gap],
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
