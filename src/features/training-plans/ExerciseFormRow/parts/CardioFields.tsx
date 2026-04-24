'use client';

import { Input } from '@/design-system';
import { CardioModeToggle } from '../CardioModeToggle';
import { Field } from '../Field';
import type { ExerciseRow } from '../ExerciseFormRow.types';

export interface CardioFieldsProps {
  exercise: ExerciseRow;
  onUpdate: (updates: Partial<ExerciseRow>) => void;
}

/**
 * Cardio mode: modality selector + either duration or HIIT fields.
 * Keeps the mode switch colocated with the fields it controls.
 */
export function CardioFields({ exercise, onUpdate }: CardioFieldsProps) {
  return (
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
  );
}
