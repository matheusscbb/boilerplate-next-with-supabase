'use client';

import { TrashIcon } from '../icons';

export interface RemoveDayButtonProps {
  onRemove: () => void;
}

/** Destructive icon button to drop the day from the plan. */
export function RemoveDayButton({ onRemove }: RemoveDayButtonProps) {
  return (
    <button
      type="button"
      aria-label="Remover dia"
      onClick={onRemove}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
