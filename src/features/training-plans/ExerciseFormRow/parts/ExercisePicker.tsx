'use client';

import type { Exercise } from '@/core/domain';
import { ExerciseCombobox } from '../../ExerciseCombobox';
import { ModeToggle } from '../ModeToggle';
import type { ExerciseRow } from '../ExerciseFormRow.types';

export interface ExercisePickerProps {
  exercise: ExerciseRow;
  onUpdate: (updates: Partial<ExerciseRow>) => void;
}

/**
 * Combobox to pick (or free-type) an exercise, plus the mode toggle shown
 * only when the exercise is NOT from the catalog (catalog entries carry
 * their own type).
 */
export function ExercisePicker({ exercise, onUpdate }: ExercisePickerProps) {
  const fromCatalog = exercise.catalogId !== '';

  const handleChange = (_id: string, ex: Exercise | null) => {
    if (ex) {
      onUpdate({
        catalogId: ex.id,
        name: ex.name,
        mode: ex.type,
        cardioMode: ex.type === 'cardio' ? 'duration' : exercise.cardioMode,
      });
    } else {
      onUpdate({ catalogId: '', name: '' });
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex-1">
        <ExerciseCombobox
          value={exercise.catalogId}
          onChange={handleChange}
          displayNameFallback={exercise.name}
        />
      </div>

      {!fromCatalog && (
        <ModeToggle
          value={exercise.mode}
          onChange={(v) => onUpdate({ mode: v })}
        />
      )}
    </div>
  );
}
