'use client';

import { Input, Button } from '@/design-system';
import { ExerciseFormRow, defaultExerciseRow } from '../ExerciseFormRow';
import type { ExerciseRow } from '../ExerciseFormRow';
import { MoonIcon, PlusIcon, TrashIcon } from './icons';
import type { WorkoutDayBuilderProps } from './WorkoutDayBuilder.types';

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
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
          <MoonIcon className="h-8 w-8 opacity-40" />
          <p className="text-sm font-medium">Dia de descanso</p>
          <p className="text-xs opacity-70">Nenhum exercício programado.</p>
        </div>
      ) : (
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
