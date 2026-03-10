import type { ThemeTokens } from '../tokens/types';

export const defaultPreset: ThemeTokens = {
  colors: {
    brand: {
      primary: '#0066cc',
      secondary: '#64748b',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f1f5f9',
    },
    foreground: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    text: {
      main: '#0f172a',
      secondary: '#64748b',
    },
    border: {
      default: '#e2e8f0',
      ring: '#0066cc',
    },
    status: {
      warning: '#f59e0b',
      info: '#0ea5e9',
      error: '#dc2626',
      success: '#22c55e',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
    },
    commons: {
      white: '#ffffff',
      black: '#000000',
      accent: '#f1f5f9',
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
    },
  },
  typography: {
    family: {
      sans: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
      mono: 'var(--font-geist-mono), ui-monospace, monospace',
      heading: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
    },
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    weight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    spacing1: '0.25rem',
    spacing2: '0.5rem',
    spacing3: '0.75rem',
    spacing4: '1rem',
    spacing5: '1.25rem',
    spacing6: '1.5rem',
    spacing8: '2rem',
    spacing10: '2.5rem',
    spacing12: '3rem',
    spacing16: '4rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
};
