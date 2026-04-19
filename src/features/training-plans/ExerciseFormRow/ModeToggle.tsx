'use client';

import type { ExerciseMode } from './ExerciseFormRow.types';

const OPTIONS: { value: ExerciseMode; label: string }[] = [
  { value: 'strength', label: 'Musculação' },
  { value: 'cardio', label: 'Cardio' },
];

interface ModeToggleProps {
  value: ExerciseMode;
  onChange: (v: ExerciseMode) => void;
}

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div className="flex h-10 overflow-hidden rounded-md border border-border">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            'px-3 text-xs font-medium transition-colors',
            value === opt.value
              ? 'bg-primary text-white'
              : 'bg-background text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
