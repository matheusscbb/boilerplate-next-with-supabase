import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';

export interface ChipProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  selected?: boolean;
  disabled?: boolean;
}

export interface ChipIconProps {
  children: React.ReactNode;
  className?: string;
}

export type ChipRemoveProps = ButtonHTMLAttributes<HTMLButtonElement>;
