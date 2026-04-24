import type { ReactNode } from 'react';

export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
}

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface TabsPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}
