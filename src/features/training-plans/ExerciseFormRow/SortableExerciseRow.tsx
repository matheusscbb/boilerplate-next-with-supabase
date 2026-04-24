'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExerciseFormRow } from './ExerciseFormRow';
import type { ExerciseFormRowProps } from './ExerciseFormRow.types';

type SortableExerciseRowProps = Omit<
  ExerciseFormRowProps,
  'isDraggable' | 'isDragging' | 'dragHandleProps' | 'setNodeRef' | 'style'
>;

/**
 * Sortable wrapper around `ExerciseFormRow`.
 *
 * Plugs `useSortable` into the row so it can be reordered inside a
 * `SortableContext` (one context per day). The presentational row stays
 * DnD-agnostic and only consumes the resulting `DragBindings`.
 */
export function SortableExerciseRow(props: SortableExerciseRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.exercise._id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    // Original row fades out — the `DragOverlay` provides the floating copy.
    opacity: isDragging ? 0 : 1,
  };

  return (
    <ExerciseFormRow
      {...props}
      isDraggable
      isDragging={isDragging}
      setNodeRef={setNodeRef}
      style={style}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}
