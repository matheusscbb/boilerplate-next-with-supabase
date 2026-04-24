import type { CalendarDayMarker } from '@/design-system';
import type { TrainingPlanFull, WorkoutSessionSummary } from '@/core/domain';
import { eachDayOfMonth } from './date';
import { resolveScheduledDay } from './resolveScheduledDay';

/**
 * Build calendar markers for a given month (first day ISO). Combines the
 * plan's scheduled pattern with the sessions that already have logs.
 */
export function buildMonthMarkers(
  plan: Pick<TrainingPlanFull, 'start_date' | 'end_date' | 'schedule_config' | 'days'> | null,
  sessions: WorkoutSessionSummary[],
  monthISO: string
): Record<string, CalendarDayMarker> {
  const markers: Record<string, CalendarDayMarker> = {};

  if (plan) {
    for (const iso of eachDayOfMonth(monthISO)) {
      const resolved = resolveScheduledDay(plan, iso);
      if (resolved) {
        markers[iso] = {
          scheduled: true,
          label: resolved.day.name,
        };
      }
    }
  }

  for (const s of sessions) {
    if (!s.has_logs) continue;
    const prev = markers[s.performed_on] ?? {};
    markers[s.performed_on] = { ...prev, logged: true };
  }

  return markers;
}
