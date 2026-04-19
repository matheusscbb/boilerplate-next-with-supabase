import { getExerciseById } from '@/shared/constants';
import type { DayRow } from '../../WorkoutDayBuilder';
import { INDIRECT_VOLUME } from '../constants';
import type { MuscleVolume } from '../PlanForm.types';

export function computeVolumeByMuscle(days: DayRow[]): Map<string, MuscleVolume> {
  const map = new Map<string, MuscleVolume>();

  const add = (muscle: string, field: keyof MuscleVolume, n: number) => {
    const prev = map.get(muscle) ?? { direct: 0, indirect: 0 };
    map.set(muscle, { ...prev, [field]: prev[field] + n });
  };

  for (const day of days) {
    if (day.isRestDay) continue;
    for (const ex of day.exercises) {
      if (ex.mode !== 'strength' || !ex.catalogId) continue;
      const exercise = getExerciseById(ex.catalogId);
      if (!exercise) continue;
      const sets = parseInt(ex.sets) || 0;
      if (sets === 0) continue;
      add(exercise.category, 'direct', sets);
      const target = INDIRECT_VOLUME[exercise.category];
      if (target) add(target, 'indirect', sets * 0.5);
    }
  }

  return map;
}

export function formatVolume(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}
