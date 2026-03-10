'use client';

import React, { createContext, useContext } from 'react';
import type { ThemeTokens } from './tokens/types';
import { defaultPreset } from './presets/default';

export interface ThemeConfig {
  preset?: 'default';
  overrides?: Partial<ThemeTokens>;
}

const ThemeContext = createContext<ThemeTokens>(defaultPreset);

function mergeTheme(base: ThemeTokens, overrides?: Partial<ThemeTokens>): ThemeTokens {
  if (!overrides) return base;
  const c = overrides.colors;
  return {
    colors: {
      ...base.colors,
      brand: { ...base.colors.brand, ...(c?.brand ?? {}) },
      background: { ...base.colors.background, ...(c?.background ?? {}) },
      foreground: { ...base.colors.foreground, ...(c?.foreground ?? {}) },
      text: { ...base.colors.text, ...(c?.text ?? {}) },
      border: { ...base.colors.border, ...(c?.border ?? {}) },
      status: { ...base.colors.status, ...(c?.status ?? {}) },
      commons: { ...base.colors.commons, ...(c?.commons ?? {}) },
    },
    typography: {
      ...base.typography,
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

function buildCssVarsString(tokens: ThemeTokens): string {
  const { brand, background, foreground, text, border, status, commons } = tokens.colors;
  const { family, size, weight, lineHeight } = tokens.typography;

  const vars: Record<string, string> = {
    // Brand
    '--color-primary': brand.primary,
    '--color-secondary': brand.secondary,

    // Background
    '--color-background': background.primary,
    '--color-background-secondary': background.secondary,

    // Foreground
    '--color-foreground': foreground.primary,
    '--color-foreground-secondary': foreground.secondary,

    // Text
    '--color-text-main': text.main,
    '--color-text-secondary': text.secondary,

    // Border
    '--color-border': border.default,
    '--color-ring': border.ring,

    // Status
    '--color-warning': status.warning,
    '--color-info': status.info,
    '--color-error': status.error,
    '--color-success': status.success,
    '--color-destructive': status.destructive,
    '--color-destructive-foreground': status.destructiveForeground,

    // Commons
    '--color-muted': commons.muted,
    '--color-muted-foreground': commons.mutedForeground,
    '--color-accent': commons.accent,
    '--color-white': commons.white,
    '--color-black': commons.black,

    // Typography — Family
    '--font-sans': family.sans,
    '--font-mono': family.mono,
    '--font-heading': family.heading,

    // Typography — Size
    '--font-size-xs': size.xs,
    '--font-size-sm': size.sm,
    '--font-size-base': size.base,
    '--font-size-lg': size.lg,
    '--font-size-xl': size.xl,
    '--font-size-2xl': size['2xl'],
    '--font-size-3xl': size['3xl'],

    // Typography — Weight
    '--font-weight-normal': weight.normal,
    '--font-weight-medium': weight.medium,
    '--font-weight-semibold': weight.semibold,
    '--font-weight-bold': weight.bold,

    // Typography — Line Height
    '--line-height-tight': lineHeight.tight,
    '--line-height-normal': lineHeight.normal,
    '--line-height-relaxed': lineHeight.relaxed,
  };

  const declarations = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');

  return `:root {\n${declarations}\n}`;
}

export function ThemeProvider({
  config = {},
  children,
}: {
  config?: ThemeConfig;
  children: React.ReactNode;
}) {
  const tokens = mergeTheme(defaultPreset, config.overrides);

  return (
    <ThemeContext.Provider value={tokens}>
      {/* Injeta os tokens como CSS vars no :root — funciona no SSR e no client */}
      <style dangerouslySetInnerHTML={{ __html: buildCssVarsString(tokens) }} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeTokens {
  const context = useContext(ThemeContext);
  if (!context) {
    return defaultPreset;
  }
  return context;
}
