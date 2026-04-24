'use client';

import { MoonIcon } from '../icons';

export interface RestDayToggleButtonProps {
  isRestDay: boolean;
  onToggle: () => void;
}

/** Icon button that flips a day between "training" and "rest" modes. */
export function RestDayToggleButton({
  isRestDay,
  onToggle,
}: RestDayToggleButtonProps) {
  return (
    <button
      type="button"
      aria-label={isRestDay ? 'Remover descanso' : 'Marcar como descanso'}
      aria-pressed={isRestDay}
      onClick={onToggle}
      className={[
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors',
        isRestDay
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      ].join(' ')}
    >
      <MoonIcon className="h-4 w-4" />
    </button>
  );
}
