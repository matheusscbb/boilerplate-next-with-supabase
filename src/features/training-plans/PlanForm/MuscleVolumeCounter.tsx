'use client';

import { EXERCISE_CATEGORIES } from '@/shared/constants';
import type { DayRow } from '../WorkoutDayBuilder';
import { computeVolumeByMuscle, formatVolume } from './helpers/volume';
import type { MuscleVolume } from './PlanForm.types';

interface MuscleVolumeCounterProps {
  days: DayRow[];
  countHalfReps: boolean;
}

export function MuscleVolumeCounter({
  days,
  countHalfReps,
}: MuscleVolumeCounterProps) {
  const volumeMap = computeVolumeByMuscle(days);

  const entries = (EXERCISE_CATEGORIES as readonly string[])
    .map((cat) => ({ cat, vol: volumeMap.get(cat) }))
    .filter((e): e is { cat: string; vol: MuscleVolume } => !!e.vol && e.vol.direct > 0);

  if (entries.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-muted-foreground">
        Adicione exercícios de musculação para ver o volume por grupo muscular.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(({ cat, vol }) => {
        const hasIndirect = countHalfReps && vol.indirect > 0;
        const total = vol.direct + (countHalfReps ? vol.indirect : 0);

        return (
          <div
            key={cat}
            className={[
              'inline-flex items-baseline gap-1.5 rounded-lg border px-3 py-1.5',
              hasIndirect
                ? 'border-secondary/30 bg-secondary/10'
                : 'border-border bg-muted/40',
            ].join(' ')}
          >
            <span className="text-xs font-medium text-muted-foreground">{cat}</span>
            <span
              className={[
                'text-sm font-bold tabular-nums',
                hasIndirect ? 'text-secondary' : 'text-foreground',
              ].join(' ')}
            >
              {formatVolume(total)}
            </span>
            {hasIndirect && (
              <span className="text-xs text-muted-foreground">
                ({formatVolume(vol.direct)}+{formatVolume(vol.indirect)})
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
