'use client';

import { Input } from '@/design-system';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ScheduleMode = 'weekdays' | 'interval' | 'cycle';

export interface DaySchedulePickerProps {
  mode: ScheduleMode;
  weekdays: number[];
  intervalDays: string;
  cycleLength: string;
  onModeChange: (mode: ScheduleMode) => void;
  onWeekdaysChange: (days: number[]) => void;
  onIntervalDaysChange: (value: string) => void;
  onCycleLengthChange: (value: string) => void;
}

// ─── Weekday config ────────────────────────────────────────────────────────────

const WEEKDAYS = [
  { label: 'Dom', value: 0 },
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 },
] as const;

const MODES: { value: ScheduleMode; label: string }[] = [
  { value: 'weekdays', label: 'Dias da semana' },
  { value: 'interval', label: 'A cada X dias' },
  { value: 'cycle', label: 'Ciclo personalizado' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function DaySchedulePicker({
  mode,
  weekdays,
  intervalDays,
  cycleLength,
  onModeChange,
  onWeekdaysChange,
  onIntervalDaysChange,
  onCycleLengthChange,
}: DaySchedulePickerProps) {
  const toggleWeekday = (day: number) => {
    if (weekdays.includes(day)) {
      onWeekdaysChange(weekdays.filter((d) => d !== day));
    } else {
      onWeekdaysChange([...weekdays, day].sort((a, b) => a - b));
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {MODES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onModeChange(value)}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              mode === value
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted hover:text-foreground',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Weekday circles */}
      {mode === 'weekdays' && (
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map(({ label, value }) => {
            const active = weekdays.includes(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                aria-label={label}
                onClick={() => toggleWeekday(value)}
                className={[
                  'flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Interval picker */}
      {mode === 'interval' && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground">Repetir a cada</span>
          <Input
            type="number"
            min={1}
            max={30}
            value={intervalDays}
            onChange={(e) => onIntervalDaysChange(e.target.value)}
            className="w-20 text-center"
          />
          <span className="text-sm text-foreground">dias</span>
        </div>
      )}

      {/* Cycle picker */}
      {mode === 'cycle' && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground">Ciclo de</span>
            <Input
              type="number"
              min={2}
              max={30}
              value={cycleLength}
              onChange={(e) => onCycleLengthChange(e.target.value)}
              className="w-20 text-center"
            />
            <span className="text-sm text-foreground">dias</span>
          </div>
          <p className="text-xs text-muted-foreground">
            O plano terá {cycleLength} dias de treino em sequência que se repetem
            automaticamente (ex: Dia 1, Dia 2 … Dia {cycleLength}, Dia 1 …).
          </p>
        </div>
      )}
    </div>
  );
}
