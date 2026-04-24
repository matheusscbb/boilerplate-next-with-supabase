import type { CSSProperties, HTMLAttributes } from 'react';

/**
 * Shared shape for drag-and-drop wiring across sortable rows in this feature.
 *
 * A "sortable wrapper" (e.g. `SortableWorkoutDay`, `SortableExerciseRow`)
 * consumes `useSortable` from `@dnd-kit/sortable` and pipes the outputs here
 * so presentational rows stay DnD-agnostic.
 */
export interface DragBindings {
  isDraggable?: boolean;
  isDragging?: boolean;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: CSSProperties;
}
