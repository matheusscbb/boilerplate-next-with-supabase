import type { ThemeTokens } from '../tokens/types';
import { defaultPreset } from './default';

/**
 * Dark preset — only color tokens differ from the light preset.
 * Typography, spacing, border-radius and shadows are inherited so the visual
 * rhythm stays consistent across modes.
 */
export const darkPreset: ThemeTokens = {
  ...defaultPreset,
  colors: {
    brand: {
      primary: '#3b82f6',
      secondary: '#94a3b8',
    },
    background: {
      primary: '#0a0a0a',
      secondary: '#171717',
    },
    foreground: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    text: {
      main: '#f8fafc',
      secondary: '#94a3b8',
    },
    border: {
      default: '#27272a',
      ring: '#3b82f6',
    },
    status: {
      warning: '#f59e0b',
      info: '#38bdf8',
      error: '#f87171',
      success: '#4ade80',
      destructive: '#f87171',
      destructiveForeground: '#0a0a0a',
    },
    commons: {
      white: '#ffffff',
      black: '#000000',
      accent: '#1f2937',
      muted: '#1f2937',
      mutedForeground: '#94a3b8',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.4)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.55), 0 4px 6px -4px rgb(0 0 0 / 0.55)',
  },
};
