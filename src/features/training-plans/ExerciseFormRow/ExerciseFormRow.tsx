'use client';

import {
  CardioFields,
  ExercisePicker,
  ExerciseRowHeader,
  StrengthFields,
} from './parts';
import type { ExerciseFormRowProps } from './ExerciseFormRow.types';

/**
 * Editable row for a single exercise inside a training day.
 *
 * Thin orchestrator: delegates presentation to `parts/*` components.
 * When drag bindings are provided, a grip handle appears in the header and
 * the row participates in `useSortable` through the wrapping container.
 */
export function ExerciseFormRow({
  exercise,
  index,
  onUpdate,
  onRemove,
  isDraggable = false,
  isDragging = false,
  dragHandleProps,
  setNodeRef,
  style,
}: ExerciseFormRowProps) {
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'rounded-lg border border-border bg-background-secondary p-3 space-y-3',
        isDragging ? 'shadow-lg ring-2 ring-primary/40' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ExerciseRowHeader
        index={index}
        onRemove={onRemove}
        isDraggable={isDraggable}
        dragHandleProps={dragHandleProps}
      />

      <ExercisePicker exercise={exercise} onUpdate={onUpdate} />

      {exercise.mode === 'strength' && (
        <StrengthFields exercise={exercise} onUpdate={onUpdate} />
      )}

      {exercise.mode === 'cardio' && (
        <CardioFields exercise={exercise} onUpdate={onUpdate} />
      )}
    </div>
  );
}
