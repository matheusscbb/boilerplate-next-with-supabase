'use client';

import { Input } from '@/design-system';
import type { Exercise } from '@/core/domain';
import { ExerciseCombobox } from '../ExerciseCombobox';
import { CardioModeToggle } from './CardioModeToggle';
import { Field } from './Field';
import { ModeToggle } from './ModeToggle';
import type { ExerciseFormRowProps } from './ExerciseFormRow.types';

export function ExerciseFormRow({
  exercise,
  index,
  onUpdate,
  onRemove,
}: ExerciseFormRowProps) {
  const fromCatalog = exercise.catalogId !== '';

  const handleComboboxChange = (id: string, ex: Exercise | null) => {
    if (ex) {
      onUpdate({
        catalogId: ex.id,
        name: ex.name,
        mode: ex.type,
        // Reset cardio sub-mode when switching to cardio
        cardioMode: ex.type === 'cardio' ? 'duration' : exercise.cardioMode,
      });
    } else {
      onUpdate({ catalogId: '', name: '' });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-background-secondary p-3 space-y-3">
      {/* Row header: index + remove */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Exercício {index + 1}
        </span>
        <button
          type="button"
          aria-label="Remover exercício"
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      </div>

      {/* Combobox + type indicator */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <ExerciseCombobox
            value={exercise.catalogId}
            onChange={handleComboboxChange}
          />
        </div>

        {!fromCatalog && (
          <ModeToggle
            value={exercise.mode}
            onChange={(v) => onUpdate({ mode: v })}
          />
        )}
      </div>

      {/* Strength fields */}
      {exercise.mode === 'strength' && (
        <div className="grid grid-cols-3 gap-2">
          <Field label="Séries">
            <Input
              type="number"
              min={1}
              value={exercise.sets}
              onChange={(e) => onUpdate({ sets: e.target.value })}
              className="text-center"
            />
          </Field>
          <Field label="Repetições">
            <Input
              type="text"
              placeholder="8-12"
              value={exercise.repsRange}
              onChange={(e) => onUpdate({ repsRange: e.target.value })}
              className="text-center"
            />
          </Field>
          <Field label="Descanso (s)">
            <Input
              type="number"
              min={0}
              step={5}
              value={exercise.restSeconds}
              onChange={(e) => onUpdate({ restSeconds: e.target.value })}
              className="text-center"
            />
          </Field>
        </div>
      )}

      {/* Cardio fields */}
      {exercise.mode === 'cardio' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              Modalidade
            </span>
            <CardioModeToggle
              value={exercise.cardioMode}
              onChange={(v) => onUpdate({ cardioMode: v })}
            />
          </div>

          {exercise.cardioMode === 'duration' && (
            <Field label="Duração (min)">
              <Input
                type="number"
                min={1}
                value={exercise.durationMinutes}
                onChange={(e) => onUpdate({ durationMinutes: e.target.value })}
                className="w-28"
              />
            </Field>
          )}

          {exercise.cardioMode === 'hiit' && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Field label="Aquecimento (min)">
                <Input
                  type="number"
                  min={0}
                  value={exercise.warmupMinutes}
                  onChange={(e) => onUpdate({ warmupMinutes: e.target.value })}
                  className="text-center"
                />
              </Field>
              <Field label="Ciclos">
                <Input
                  type="number"
                  min={1}
                  value={exercise.cycles}
                  onChange={(e) => onUpdate({ cycles: e.target.value })}
                  className="text-center"
                />
              </Field>
              <Field label="Rápido (s)">
                <Input
                  type="number"
                  min={1}
                  step={5}
                  value={exercise.workSeconds}
                  onChange={(e) => onUpdate({ workSeconds: e.target.value })}
                  className="text-center"
                />
              </Field>
              <Field label="Lento (s)">
                <Input
                  type="number"
                  min={1}
                  step={5}
                  value={exercise.hiitRestSeconds}
                  onChange={(e) => onUpdate({ hiitRestSeconds: e.target.value })}
                  className="text-center"
                />
              </Field>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
