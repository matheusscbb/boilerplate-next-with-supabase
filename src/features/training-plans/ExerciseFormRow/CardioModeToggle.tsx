'use client';

import type { CardioMode } from './ExerciseFormRow.types';

interface CardioModeToggleProps {
  value: CardioMode;
  onChange: (v: CardioMode) => void;
}

export function CardioModeToggle({ value, onChange }: CardioModeToggleProps) {
  return (
    <div className="flex h-10 overflow-hidden rounded-md border border-border">
      {(['duration', 'hiit'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={[
            'px-3 text-xs font-medium transition-colors',
            value === m
              ? 'bg-primary text-white'
              : 'bg-background text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {m === 'duration' ? 'Duração' : 'HIIT'}
        </button>
      ))}
    </div>
  );
}
