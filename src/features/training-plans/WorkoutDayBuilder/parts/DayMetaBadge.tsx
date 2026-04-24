export interface DayScheduleBadgeProps {
  label: string;
}

/** Pill showing the scheduled weekday (e.g. "Seg", "Qua"). */
export function DayScheduleBadge({ label }: DayScheduleBadgeProps) {
  return (
    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
      {label}
    </span>
  );
}

export interface DayStatusBadgeProps {
  isRestDay: boolean;
  exerciseCount: number;
}

/**
 * Either the "Descanso" pill (rest day) or the exercise counter text.
 * Swaps based on the day state so the header stays visually balanced.
 */
export function DayStatusBadge({
  isRestDay,
  exerciseCount,
}: DayStatusBadgeProps) {
  if (isRestDay) {
    return (
      <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        Descanso
      </span>
    );
  }

  return (
    <span className="shrink-0 text-xs text-muted-foreground">
      {exerciseCount} {exerciseCount === 1 ? 'exercício' : 'exercícios'}
    </span>
  );
}
