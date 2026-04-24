'use client';

import { Input } from '@/design-system';
import { Field } from '../Field';
import type { ExerciseRow } from '../ExerciseFormRow.types';

export interface StrengthFieldsProps {
  exercise: ExerciseRow;
  onUpdate: (updates: Partial<ExerciseRow>) => void;
}

/** Strength mode: sets / reps / rest. */
export function StrengthFields({ exercise, onUpdate }: StrengthFieldsProps) {
  return (
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
  );
}
