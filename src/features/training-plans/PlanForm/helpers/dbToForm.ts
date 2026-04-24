import type { CardioConfig, ScheduleConfig, ScheduleType } from '@/core/domain';
import { exerciseDatabase } from '@/shared/constants';
import type { ScheduleMode } from '../../DaySchedulePicker';
import type { DayRow } from '../../WorkoutDayBuilder';
import type { ExerciseRow } from '../../ExerciseFormRow';
import type { FormState } from '../PlanForm.types';

/** Prefer DB column; otherwise match saved name to the local catalog (legacy rows). */
function resolveCatalogExerciseId(
  catalogFromDb: string | null | undefined,
  exerciseName: string
): string {
  const fromCol = catalogFromDb?.trim();
  if (fromCol) return fromCol;
  const n = exerciseName.trim().toLowerCase();
  if (!n) return '';
  const hit = exerciseDatabase.find((e) => e.name.trim().toLowerCase() === n);
  return hit?.id ?? '';
}

function asScheduleConfig(
  schedule_type: ScheduleType,
  raw: unknown
): ScheduleConfig {
  if (raw && typeof raw === 'object' && 'type' in raw) {
    const t = (raw as { type: string }).type;
    if (t === schedule_type) return raw as ScheduleConfig;
  }
  if (schedule_type === 'weekdays') {
    return { type: 'weekdays', days: [1, 3, 5] };
  }
  if (schedule_type === 'interval') {
    return { type: 'interval', interval_days: 2 };
  }
  return { type: 'cycle', cycle_length: 7 };
}

function mapExerciseRow(ex: {
  id: string;
  name: string;
  catalog_exercise_id?: string | null;
  exercise_type: 'strength' | 'cardio';
  sets: number | null;
  reps_range: string | null;
  rest_seconds: number | null;
  cardio_config: CardioConfig | null;
}): ExerciseRow {
  const catalogId = resolveCatalogExerciseId(ex.catalog_exercise_id, ex.name);

  if (ex.exercise_type === 'strength') {
    return {
      _id: ex.id,
      catalogId,
      name: ex.name,
      mode: 'strength',
      sets: String(ex.sets ?? 3),
      repsRange: ex.reps_range ?? '8-12',
      restSeconds: String(ex.rest_seconds ?? 60),
      cardioMode: 'duration',
      durationMinutes: '30',
      warmupMinutes: '5',
      cycles: '10',
      workSeconds: '40',
      hiitRestSeconds: '20',
    };
  }

  const cfg = ex.cardio_config;
  if (cfg?.mode === 'hiit') {
    return {
      _id: ex.id,
      catalogId,
      name: ex.name,
      mode: 'cardio',
      sets: '3',
      repsRange: '8-12',
      restSeconds: '60',
      cardioMode: 'hiit',
      durationMinutes: '30',
      warmupMinutes: String(Math.max(1, Math.round(cfg.warmup_seconds / 60))),
      cycles: String(cfg.cycles),
      workSeconds: String(cfg.work_seconds),
      hiitRestSeconds: String(cfg.rest_seconds),
    };
  }

  const durationSec =
    cfg?.mode === 'duration' ? cfg.duration_seconds : 30 * 60;
  return {
    _id: ex.id,
    catalogId,
    name: ex.name,
    mode: 'cardio',
    sets: '3',
    repsRange: '8-12',
    restSeconds: '60',
    cardioMode: 'duration',
    durationMinutes: String(Math.max(1, Math.round(durationSec / 60))),
    warmupMinutes: '5',
    cycles: '10',
    workSeconds: '40',
    hiitRestSeconds: '20',
  };
}

function mapDayRow(row: {
  id: string;
  name: string;
  order_index: number;
  exercises:
    | {
        id: string;
        name: string;
        catalog_exercise_id?: string | null;
        exercise_type: 'strength' | 'cardio';
        sets: number | null;
        reps_range: string | null;
        rest_seconds: number | null;
        cardio_config: CardioConfig | null;
        order_index: number;
      }[]
    | null;
}): DayRow {
  const sortedEx = [...(row.exercises ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  );
  return {
    _id: row.id,
    name: row.name,
    isRestDay: false,
    exercises:
      sortedEx.length > 0
        ? sortedEx.map(mapExerciseRow)
        : [
            {
              _id: crypto.randomUUID(),
              catalogId: '',
              name: '',
              mode: 'strength' as const,
              sets: '3',
              repsRange: '8-12',
              restSeconds: '60',
              cardioMode: 'duration' as const,
              durationMinutes: '30',
              warmupMinutes: '5',
              cycles: '10',
              workSeconds: '40',
              hiitRestSeconds: '20',
            },
          ],
  };
}

export type TrainingPlanDetailRow = {
  name: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  schedule_type: ScheduleType;
  schedule_config: unknown;
  days:
    | {
        id: string;
        name: string;
        order_index: number;
        exercises:
          | {
              id: string;
              name: string;
              catalog_exercise_id?: string | null;
              exercise_type: 'strength' | 'cardio';
              sets: number | null;
              reps_range: string | null;
              rest_seconds: number | null;
              cardio_config: CardioConfig | null;
              order_index: number;
            }[]
          | null;
      }[]
    | null;
};

/**
 * Builds {@link FormState} from a Supabase nested row (plan + days + exercises).
 */
export function trainingPlanRowToFormState(row: TrainingPlanDetailRow): FormState {
  const cfg = asScheduleConfig(row.schedule_type, row.schedule_config);

  let weekdays: number[] = [1, 3, 5];
  let intervalDays = '2';
  let cycleLength = '7';

  if (cfg.type === 'weekdays') {
    weekdays = [...cfg.days].sort((a, b) => a - b);
  } else if (cfg.type === 'interval') {
    intervalDays = String(cfg.interval_days);
  } else {
    cycleLength = String(cfg.cycle_length);
  }

  const sortedDays = [...(row.days ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  );
  const days: DayRow[] = sortedDays.map((d) => mapDayRow(d));

  return {
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date ?? '',
    isActive: row.is_active,
    scheduleMode: row.schedule_type as ScheduleMode,
    weekdays,
    intervalDays,
    cycleLength,
    days:
      days.length > 0
        ? days
        : [
            {
              _id: crypto.randomUUID(),
              name: 'Dia A',
              isRestDay: false,
              exercises: [
                {
                  _id: crypto.randomUUID(),
                  catalogId: '',
                  name: '',
                  mode: 'strength',
                  sets: '3',
                  repsRange: '8-12',
                  restSeconds: '60',
                  cardioMode: 'duration',
                  durationMinutes: '30',
                  warmupMinutes: '5',
                  cycles: '10',
                  workSeconds: '40',
                  hiitRestSeconds: '20',
                },
              ],
            },
          ],
    countHalfReps: false,
  };
}
