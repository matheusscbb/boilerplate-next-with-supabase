'use client';

import { useEffect, useState } from 'react';
import { useThemeMode, type ThemeMode } from '@/themes';
import type {
  ThemeToggleProps,
  ThemeToggleSegmentedProps,
  ThemeToggleIconProps,
} from './ThemeToggle.types';

// ─── Icons ─────────────────────────────────────────────────────────────────────

function SunIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx={12} cy={12} r={4} />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

function SystemIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x={3} y={4} width={18} height={12} rx={2} />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

const DEFAULT_LABELS: Record<ThemeMode, string> = {
  light: 'Claro',
  dark: 'Escuro',
  system: 'Sistema',
};

const ICONS: Record<ThemeMode, typeof SunIcon> = {
  light: SunIcon,
  dark: MoonIcon,
  system: SystemIcon,
};

const ORDER: ThemeMode[] = ['light', 'dark', 'system'];

// Avoid icon mismatches between SSR (no class) and CSR (after hydration).
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

const SIZE_STYLES = {
  sm: { button: 'h-8 w-8', icon: 'h-4 w-4', segmentH: 'h-8', segmentText: 'text-xs' },
  md: { button: 'h-9 w-9', icon: 'h-4 w-4', segmentH: 'h-9', segmentText: 'text-sm' },
};

// ─── Icon variant ──────────────────────────────────────────────────────────────

function ThemeToggleIcon({
  size = 'md',
  className = '',
  labels,
  ...buttonProps
}: ThemeToggleIconProps) {
  const { mode, resolvedMode, toggleMode } = useThemeMode();
  const mounted = useMounted();
  const sz = SIZE_STYLES[size];

  // Before hydration we can't know the user's stored preference, so render
  // a neutral placeholder that won't cause layout shift.
  const display: ThemeMode = mounted ? mode : 'system';
  const Icon = mounted ? ICONS[resolvedMode === 'dark' ? 'dark' : 'light'] : SystemIcon;
  const labelMap = { ...DEFAULT_LABELS, ...(labels ?? {}) };
  const ariaLabel = `Alternar tema (atual: ${labelMap[display]})`;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={toggleMode}
      className={[
        'inline-flex cursor-pointer items-center justify-center rounded-md transition-colors',
        'text-foreground-secondary hover:bg-muted hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        sz.button,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...buttonProps}
    >
      <Icon className={sz.icon} />
    </button>
  );
}

// ─── Segmented variant ─────────────────────────────────────────────────────────

function ThemeToggleSegmented({
  size = 'md',
  className = '',
  labels,
}: ThemeToggleSegmentedProps) {
  const { mode, setMode } = useThemeMode();
  const mounted = useMounted();
  const sz = SIZE_STYLES[size];
  const labelMap = { ...DEFAULT_LABELS, ...(labels ?? {}) };

  return (
    <div
      role="radiogroup"
      aria-label="Selecionar tema"
      className={[
        'inline-flex items-center gap-1 rounded-lg border border-border bg-background-secondary p-1',
        sz.segmentH,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {ORDER.map((m) => {
        const Icon = ICONS[m];
        const active = mounted && mode === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setMode(m)}
            className={[
              'inline-flex h-full cursor-pointer items-center gap-1.5 rounded-md px-2.5 font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              sz.segmentText,
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{labelMap[m]}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Public component ──────────────────────────────────────────────────────────

export function ThemeToggle(props: ThemeToggleProps) {
  if (props.variant === 'segmented') {
    return <ThemeToggleSegmented {...props} />;
  }
  return <ThemeToggleIcon {...(props as ThemeToggleIconProps)} />;
}
