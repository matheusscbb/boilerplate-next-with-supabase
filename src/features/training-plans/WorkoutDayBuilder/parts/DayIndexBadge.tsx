export interface DayIndexBadgeProps {
  index: number;
  muted?: boolean;
}

/** Rounded numeric badge shown on the left side of the day header. */
export function DayIndexBadge({ index, muted = false }: DayIndexBadgeProps) {
  return (
    <span
      className={[
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
        muted ? 'bg-muted text-muted-foreground' : 'bg-primary text-white',
      ].join(' ')}
    >
      {index + 1}
    </span>
  );
}
