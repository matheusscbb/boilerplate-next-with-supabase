'use client';

import { memo } from 'react';
import { NumberStepper } from '@/design-system';
import type { SetRowProps } from './SetRow.types';

function formatRest(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m}min`;
  return `${m}min ${s}s`;
}

function SetRowImpl({ value, readOnly, restSeconds, onChange, onRemove }: SetRowProps) {
  const isCompleted = !!value.completedAt;
  const isExtra = !!value.isExtra;

  const toggleCompleted = (checked: boolean) => {
    onChange({
      ...value,
      completedAt: checked ? new Date().toISOString() : null,
    });
  };

  return (
    <div
      className={[
        'flex flex-wrap items-center gap-2 rounded-md border p-2',
        isCompleted
          ? 'border-green-500/40 bg-green-500/5'
          : isExtra
            ? 'border-amber-500/30 bg-amber-500/5'
            : 'border-border bg-muted/40',
      ].join(' ')}
    >
      <span
        className={[
          'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
          isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-foreground',
        ].join(' ')}
      >
        {value.setNumber}
      </span>

      {isExtra && !isCompleted && (
        <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-500/15 text-amber-700 dark:text-amber-400">
          Extra
        </span>
      )}

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Reps
        </label>
        <NumberStepper
          value={value.reps}
          size="sm"
          min={0}
          max={999}
          precision={0}
          readOnly={readOnly}
          onChange={(reps) => onChange({ ...value, reps })}
        />
      </div>

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Peso
        </label>
        <NumberStepper
          value={value.weightKg}
          size="sm"
          min={0}
          max={999}
          step={2.5}
          precision={2}
          suffix="kg"
          readOnly={readOnly}
          onChange={(weightKg) => onChange({ ...value, weightKg })}
        />
      </div>

      {typeof restSeconds === 'number' && restSeconds > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Descanso
          </span>
          <span className="inline-flex h-8 items-center rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground">
            {formatRest(restSeconds)}
          </span>
        </div>
      )}

      <label
        className={[
          'ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
          readOnly && 'cursor-not-allowed opacity-50',
          isCompleted ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          type="checkbox"
          className="size-4 rounded border border-border bg-transparent text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          checked={isCompleted}
          disabled={readOnly}
          onChange={(e) => toggleCompleted(e.target.checked)}
          aria-label={`Marcar série ${value.setNumber} como concluída`}
        />
        Concluído
      </label>

      {!readOnly && isExtra && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover série extra ${value.setNumber}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-destructive"
        >
          ×
        </button>
      )}
    </div>
  );
}

export const SetRow = memo(SetRowImpl);
