'use client';

import { Input, Button } from '@/design-system';
import { ExerciseFormRow, defaultExerciseRow } from './ExerciseFormRow';
import type { ExerciseRow } from './ExerciseFormRow';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface DayRow {
  _id: string;
  name: string;
  isRestDay: boolean;
  exercises: ExerciseRow[];
}

export function defaultDayRow(index: number): DayRow {
  return {
    _id: crypto.randomUUID(),
    name: `Dia ${String.fromCharCode(65 + index)}`,
    isRestDay: false,
    exercises: [defaultExerciseRow()],
  };
}

interface WorkoutDayBuilderProps {
  day: DayRow;
  index: number;
  scheduleLabel?: string;
  canRemove?: boolean;
  onUpdate: (updates: Partial<Omit<DayRow, '_id'>>) => void;
  onRemove: () => void;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function MoonIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function TrashIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}

function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkoutDayBuilder({
  day,
  index,
  scheduleLabel,
  canRemove = true,
  onUpdate,
  onRemove,
}: WorkoutDayBuilderProps) {
  const addExercise = () => {
    onUpdate({ exercises: [...day.exercises, defaultExerciseRow()] });
  };

  const removeExercise = (exId: string) => {
    onUpdate({ exercises: day.exercises.filter((e) => e._id !== exId) });
  };

  const updateExercise = (exId: string, updates: Partial<ExerciseRow>) => {
    onUpdate({
      exercises: day.exercises.map((e) =>
        e._id === exId ? { ...e, ...updates } : e
      ),
    });
  };

  const toggleRestDay = () => {
    onUpdate({ isRestDay: !day.isRestDay });
  };

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      {/* Day header */}
      <div className="flex items-center gap-3 border-b border-border bg-background-secondary px-4 py-3">
        {/* Index badge */}
        <span
          className={[
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            day.isRestDay
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary text-white',
          ].join(' ')}
        >
          {index + 1}
        </span>

        {/* Day name */}
        <Input
          value={day.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Nome do dia (ex: Peito e Tríceps)"
          className="flex-1 border-0 bg-transparent px-0 py-0 text-sm font-medium focus:ring-0 h-auto"
        />

        {/* Schedule label (e.g. weekday) */}
        {scheduleLabel && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {scheduleLabel}
          </span>
        )}

        {/* Rest day badge / exercise count */}
        {day.isRestDay ? (
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Descanso
          </span>
        ) : (
          <span className="shrink-0 text-xs text-muted-foreground">
            {day.exercises.length}{' '}
            {day.exercises.length === 1 ? 'exercício' : 'exercícios'}
          </span>
        )}

        {/* Rest day toggle */}
        <button
          type="button"
          aria-label={day.isRestDay ? 'Remover descanso' : 'Marcar como descanso'}
          aria-pressed={day.isRestDay}
          onClick={toggleRestDay}
          className={[
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors',
            day.isRestDay
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          ].join(' ')}
        >
          <MoonIcon className="h-4 w-4" />
        </button>

        {/* Remove day — only shown when count is user-driven */}
        {canRemove && (
          <button
            type="button"
            aria-label="Remover dia"
            onClick={onRemove}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Body */}
      {day.isRestDay ? (
        /* Rest day banner */
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
          <MoonIcon className="h-8 w-8 opacity-40" />
          <p className="text-sm font-medium">Dia de descanso</p>
          <p className="text-xs opacity-70">Nenhum exercício programado.</p>
        </div>
      ) : (
        /* Exercises */
        <div className="space-y-2 p-4">
          {day.exercises.map((exercise, exIdx) => (
            <ExerciseFormRow
              key={exercise._id}
              exercise={exercise}
              index={exIdx}
              onUpdate={(updates) => updateExercise(exercise._id, updates)}
              onRemove={() => removeExercise(exercise._id)}
            />
          ))}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addExercise}
            className="mt-1 w-full border border-dashed border-border text-muted-foreground hover:text-foreground"
          >
            <PlusIcon className="mr-1.5 h-4 w-4" />
            Adicionar exercício
          </Button>
        </div>
      )}
    </div>
  );
}
