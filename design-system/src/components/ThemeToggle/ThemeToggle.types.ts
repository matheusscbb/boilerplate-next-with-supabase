import type { ButtonHTMLAttributes } from 'react';
import type { ThemeMode } from '@/themes';

export type ThemeToggleVariant = 'icon' | 'segmented';
export type ThemeToggleSize = 'sm' | 'md';

interface BaseProps {
  /**
   * Visual variant.
   * - `icon`: a single round button that cycles light → dark → system.
   * - `segmented`: 3-segment switch with explicit options.
   */
  variant?: ThemeToggleVariant;
  size?: ThemeToggleSize;
  className?: string;
  /**
   * Optional label list overrides for the segmented variant.
   * Keys: 'light' | 'dark' | 'system'.
   */
  labels?: Partial<Record<ThemeMode, string>>;
}

export interface ThemeToggleIconProps
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> {
  variant?: 'icon';
}

export interface ThemeToggleSegmentedProps extends BaseProps {
  variant: 'segmented';
}

export type ThemeToggleProps = ThemeToggleIconProps | ThemeToggleSegmentedProps;
