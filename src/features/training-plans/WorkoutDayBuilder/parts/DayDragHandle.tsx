'use client';

import { DragHandle } from '../../_shared/dnd';
import type { DragHandleProps } from '../../_shared/dnd';

/** Day-specific wrapper around the shared `DragHandle` — keeps naming/usage explicit in the day header. */
export function DayDragHandle({
  handleProps,
  className,
}: Pick<DragHandleProps, 'handleProps' | 'className'>) {
  return (
    <DragHandle
      handleProps={handleProps}
      label="Arrastar dia para reordenar"
      className={className}
    />
  );
}
