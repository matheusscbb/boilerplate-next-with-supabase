'use client';

import type { HTMLAttributes } from 'react';
import { DragHandle } from '../../_shared/dnd';

export interface ExerciseRowHeaderProps {
  index: number;
  onRemove: () => void;
  isDraggable?: boolean;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
}

/** Top row of an exercise card: grip + label on the left, remove on the right. */
export function ExerciseRowHeader({
  index,
  onRemove,
  isDraggable = false,
  dragHandleProps,
}: ExerciseRowHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      {isDraggable && (
        <DragHandle
          size="sm"
          handleProps={dragHandleProps}
          label="Arrastar exercício para reordenar"
        />
      )}
      <span className="text-xs font-semibold text-muted-foreground">
        Exercício {index + 1}
      </span>
      <span className="flex-1" />
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
  );
}
