import type {
  ScheduleConfig,
  TrainingDayWithExercises,
  TrainingPlanFull,
} from '@/core/domain';
import { diffInDays, parseISODate } from './date';

// =============================================================================
// Pure scheduler: given a plan + ISO date, decide which training_day is
// scheduled on that date (if any). Used by both the calendar (to mark days)
// and the panel (to load the exercise list).
// =============================================================================

function isWithinRange(iso: string, start: string, end: string | null): boolean {
  if (iso < start) return false;
  if (end && iso > end) return false;
  return true;
}

function dayIndexForWeekdays(
  iso: string,
  start: string,
  cfg: Extract<ScheduleConfig, { type: 'weekdays' }>,
  totalDays: number
): number | null {
  const weekdays = [...cfg.days].sort((a, b) => a - b);
  if (weekdays.length === 0 || totalDays === 0) return null;

  const target = parseISODate(iso);
  const targetWeekday = target.getDay();
  if (!weekdays.includes(targetWeekday)) return null;

  // Count how many scheduled weekdays have occurred between `start` and `iso` (inclusive).
  // For reasonable plan lengths (weeks/months), iterating is trivially fast; we
  // avoid clever math to keep semantics crystal clear.
  let occurrences = 0;
  const startDate = parseISODate(start);
  const cursor = new Date(startDate);
  while (cursor.getTime() <= target.getTime()) {
    if (weekdays.includes(cursor.getDay())) occurrences += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  if (occurrences === 0) return null;
  return (occurrences - 1) % totalDays;
}

function dayIndexForInterval(
  iso: string,
  start: string,
  cfg: Extract<ScheduleConfig, { type: 'interval' }>,
  totalDays: number
): number | null {
  const every = Math.max(1, cfg.interval_days);
  const delta = diffInDays(iso, start);
  if (delta < 0) return null;
  if (delta % every !== 0) return null;
  if (totalDays === 0) return null;
  return (delta / every) % totalDays;
}

function dayIndexForCycle(
  iso: string,
  start: string,
  cfg: Extract<ScheduleConfig, { type: 'cycle' }>,
  totalDays: number
): number | null {
  const length = Math.max(1, cfg.cycle_length);
  const delta = diffInDays(iso, start);
  if (delta < 0) return null;
  if (totalDays === 0) return null;
  // Map cycle position → training_day. If the trainer provided fewer days than
  // the cycle_length, we rotate modulo totalDays so no day is skipped.
  const cyclePos = delta % length;
  return cyclePos % totalDays;
}

export interface ResolvedScheduledDay {
  day: TrainingDayWithExercises;
  /** 0-based index within the plan's ordered training_days. */
  index: number;
}

/**
 * Returns the training day scheduled for `iso` within `plan`, or `null` if
 * the date falls outside the plan range or on a rest day.
 *
 * Pure function — suitable for both server and client.
 */
export function resolveScheduledDay(
  plan: Pick<TrainingPlanFull, 'start_date' | 'end_date' | 'schedule_config' | 'days'>,
  iso: string
): ResolvedScheduledDay | null {
  if (!isWithinRange(iso, plan.start_date, plan.end_date)) return null;

  const sortedDays = [...plan.days].sort((a, b) => a.order_index - b.order_index);
  const total = sortedDays.length;
  if (total === 0) return null;

  let idx: number | null = null;
  switch (plan.schedule_config.type) {
    case 'weekdays':
      idx = dayIndexForWeekdays(iso, plan.start_date, plan.schedule_config, total);
      break;
    case 'interval':
      idx = dayIndexForInterval(iso, plan.start_date, plan.schedule_config, total);
      break;
    case 'cycle':
      idx = dayIndexForCycle(iso, plan.start_date, plan.schedule_config, total);
      break;
  }

  if (idx === null) return null;
  return { day: sortedDays[idx], index: idx };
}
