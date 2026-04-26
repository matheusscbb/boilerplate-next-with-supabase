'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ThemeTokens } from './tokens/types';
import { defaultPreset } from './presets/default';
import { darkPreset } from './presets/dark';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  preset?: 'default';
  /**
   * Default mode applied on first visit (before any user choice is persisted).
   * Defaults to `'system'`.
   */
  defaultMode?: ThemeMode;
  /**
   * Optional overrides applied on top of BOTH the light and dark presets.
   * Use this to customize brand colors, fonts, etc.
   */
  overrides?: Partial<ThemeTokens>;
  /**
   * When false, the user choice is not persisted to localStorage.
   * Defaults to true.
   */
  enableStorage?: boolean;
  /**
   * localStorage key used to persist the user choice. Defaults to `'theme'`.
   */
  storageKey?: string;
}

interface ThemeContextValue {
  /** Resolved tokens for the *currently active* mode (light or dark). */
  tokens: ThemeTokens;
  /** User preference: 'light' | 'dark' | 'system'. */
  mode: ThemeMode;
  /** Actual mode being rendered: 'light' | 'dark'. */
  resolvedMode: ResolvedThemeMode;
  /** Update the user preference. */
  setMode: (mode: ThemeMode) => void;
  /** Cycle through light → dark → system → light. */
  toggleMode: () => void;
}

const STORAGE_KEY_DEFAULT = 'theme';
const DARK_CLASS = 'dark';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function mergeTheme(base: ThemeTokens, overrides?: Partial<ThemeTokens>): ThemeTokens {
  if (!overrides) return base;
  const c = overrides.colors;
  return {
    colors: {
      brand: { ...base.colors.brand, ...(c?.brand ?? {}) },
      background: { ...base.colors.background, ...(c?.background ?? {}) },
      foreground: { ...base.colors.foreground, ...(c?.foreground ?? {}) },
      text: { ...base.colors.text, ...(c?.text ?? {}) },
      border: { ...base.colors.border, ...(c?.border ?? {}) },
      status: { ...base.colors.status, ...(c?.status ?? {}) },
      commons: { ...base.colors.commons, ...(c?.commons ?? {}) },
    },
    typography: {
      family: { ...base.typography.family, ...(overrides.typography?.family ?? {}) },
      size: { ...base.typography.size, ...(overrides.typography?.size ?? {}) },
      weight: { ...base.typography.weight, ...(overrides.typography?.weight ?? {}) },
      lineHeight: { ...base.typography.lineHeight, ...(overrides.typography?.lineHeight ?? {}) },
    },
    spacing: { ...base.spacing, ...overrides.spacing },
    borderRadius: { ...base.borderRadius, ...overrides.borderRadius },
    shadows: { ...base.shadows, ...overrides.shadows },
  };
}

function tokensToVars(tokens: ThemeTokens): Record<string, string> {
  const { brand, background, foreground, text, border, status, commons } = tokens.colors;
  const { family, size, weight, lineHeight } = tokens.typography;

  return {
    '--color-primary': brand.primary,
    '--color-secondary': brand.secondary,

    '--color-background': background.primary,
    '--color-background-secondary': background.secondary,

    '--color-foreground': foreground.primary,
    '--color-foreground-secondary': foreground.secondary,

    '--color-text-main': text.main,
    '--color-text-secondary': text.secondary,

    '--color-border': border.default,
    '--color-ring': border.ring,

    '--color-warning': status.warning,
    '--color-info': status.info,
    '--color-error': status.error,
    '--color-success': status.success,
    '--color-destructive': status.destructive,
    '--color-destructive-foreground': status.destructiveForeground,

    '--color-muted': commons.muted,
    '--color-muted-foreground': commons.mutedForeground,
    '--color-accent': commons.accent,
    '--color-white': commons.white,
    '--color-black': commons.black,

    '--font-sans': family.sans,
    '--font-mono': family.mono,
    '--font-heading': family.heading,

    '--font-size-xs': size.xs,
    '--font-size-sm': size.sm,
    '--font-size-base': size.base,
    '--font-size-lg': size.lg,
    '--font-size-xl': size.xl,
    '--font-size-2xl': size['2xl'],
    '--font-size-3xl': size['3xl'],

    '--font-weight-normal': weight.normal,
    '--font-weight-medium': weight.medium,
    '--font-weight-semibold': weight.semibold,
    '--font-weight-bold': weight.bold,

    '--line-height-tight': lineHeight.tight,
    '--line-height-normal': lineHeight.normal,
    '--line-height-relaxed': lineHeight.relaxed,
  };
}

function buildCssVarsString(light: ThemeTokens, dark: ThemeTokens): string {
  const lightVars = tokensToVars(light);
  const darkVars = tokensToVars(dark);

  const lightDecls = Object.entries(lightVars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');

  // Only emit dark vars that actually differ (smaller payload, easier to debug).
  const darkDecls = Object.entries(darkVars)
    .filter(([k, v]) => lightVars[k] !== v)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');

  return `:root {\n${lightDecls}\n}\n\n.${DARK_CLASS} {\n${darkDecls}\n}\n`;
}

function getSystemPreference(): ResolvedThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveMode(mode: ThemeMode): ResolvedThemeMode {
  return mode === 'system' ? getSystemPreference() : mode;
}

function applyDocumentClass(resolved: ResolvedThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add(DARK_CLASS);
  } else {
    root.classList.remove(DARK_CLASS);
  }
  // Helps native UI (scrollbars, form controls) match the theme.
  root.style.colorScheme = resolved;
}

export function ThemeProvider({
  config = {},
  children,
}: {
  config?: ThemeConfig;
  children: React.ReactNode;
}) {
  const {
    defaultMode = 'system',
    overrides,
    enableStorage = true,
    storageKey = STORAGE_KEY_DEFAULT,
  } = config;

  const lightTokens = useMemo(() => mergeTheme(defaultPreset, overrides), [overrides]);
  const darkTokens = useMemo(() => mergeTheme(darkPreset, overrides), [overrides]);

  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [resolvedMode, setResolvedMode] = useState<ResolvedThemeMode>(() =>
    resolveMode(defaultMode),
  );

  // Hydrate from localStorage / current document state on first client render.
  useEffect(() => {
    let initial: ThemeMode = defaultMode;
    if (enableStorage) {
      try {
        const stored = window.localStorage.getItem(storageKey) as ThemeMode | null;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          initial = stored;
        }
      } catch {
        // localStorage might be unavailable (private mode, SSR-like envs)
      }
    }
    setModeState(initial);
    const resolved = resolveMode(initial);
    setResolvedMode(resolved);
    applyDocumentClass(resolved);
  }, [defaultMode, enableStorage, storageKey]);

  // React to OS-level changes when user is on 'system'.
  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const resolved: ResolvedThemeMode = mql.matches ? 'dark' : 'light';
      setResolvedMode(resolved);
      applyDocumentClass(resolved);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [mode]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      const resolved = resolveMode(next);
      setResolvedMode(resolved);
      applyDocumentClass(resolved);
      if (enableStorage) {
        try {
          window.localStorage.setItem(storageKey, next);
        } catch {
          // ignore persistence errors
        }
      }
    },
    [enableStorage, storageKey],
  );

  const toggleMode = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light');
  }, [mode, setMode]);

  const cssVars = useMemo(
    () => buildCssVarsString(lightTokens, darkTokens),
    [lightTokens, darkTokens],
  );

  const tokens = resolvedMode === 'dark' ? darkTokens : lightTokens;

  const value = useMemo<ThemeContextValue>(
    () => ({ tokens, mode, resolvedMode, setMode, toggleMode }),
    [tokens, mode, resolvedMode, setMode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      {/* Tokens for both light and dark are emitted at once.
          The active mode is selected via the `dark` class on <html>. */}
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      {children}
    </ThemeContext.Provider>
  );
}

/** Returns the resolved theme tokens for the currently active mode. */
export function useTheme(): ThemeTokens {
  const ctx = useContext(ThemeContext);
  if (!ctx) return defaultPreset;
  return ctx.tokens;
}

/** Returns the current theme mode plus setters/toggle for switching it. */
export function useThemeMode(): {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
} {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      mode: 'system',
      resolvedMode: 'light',
      setMode: () => {},
      toggleMode: () => {},
    };
  }
  return {
    mode: ctx.mode,
    resolvedMode: ctx.resolvedMode,
    setMode: ctx.setMode,
    toggleMode: ctx.toggleMode,
  };
}
