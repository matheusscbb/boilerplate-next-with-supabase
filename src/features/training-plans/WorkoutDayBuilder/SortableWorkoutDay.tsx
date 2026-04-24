'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WorkoutDayBuilder } from './WorkoutDayBuilder';
import type { WorkoutDayBuilderProps } from './WorkoutDayBuilder.types';

type SortableWorkoutDayProps = Omit<
  WorkoutDayBuilderProps,
  'isDraggable' | 'isDragging' | 'dragHandleProps' | 'setNodeRef' | 'style'
> & {
  /**
   * When false, the day renders without drag affordances (no grip handle,
   * no transform/transition). Used for schedule modes where order is fixed
   * (e.g. weekdays). Defaults to `true`.
   */
  draggable?: boolean;
};

export function SortableWorkoutDay({
  draggable = true,
  ...props
}: SortableWorkoutDayProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.day._id, disabled: !draggable });

  // Use CSS.Translate (translate only, no scale) to avoid text blur.
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    // The card itself fades out while dragging — the DragOverlay renders
    // a crisp floating copy, so we don't want a duplicated card visible.
    opacity: isDragging ? 0 : 1,
  };

  return (
    <WorkoutDayBuilder
      {...props}
      isDraggable={draggable}
      isDragging={isDragging}
      setNodeRef={setNodeRef}
      style={style}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}
