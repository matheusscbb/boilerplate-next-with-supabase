import type { HTMLAttributes } from 'react';

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}
