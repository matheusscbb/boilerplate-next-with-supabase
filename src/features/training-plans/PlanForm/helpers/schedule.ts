import { defaultDayRow } from '../../WorkoutDayBuilder';
import type { DayRow } from '../../WorkoutDayBuilder';
import { INITIAL_WEEKDAYS, WEEKDAY_LABELS } from '../constants';
import type { FormState } from '../PlanForm.types';

export function syncDaysToCount(
  days: DayRow[],
  count: number,
  nameFn?: (i: number) => string
): DayRow[] {
  if (days.length === count) return days;
  if (days.length < count) {
    const extra = Array.from({ length: count - days.length }, (_, i) => {
      const row = defaultDayRow(days.length + i);
      if (nameFn) row.name = nameFn(days.length + i);
      return row;
    });
    return [...days, ...extra];
  }
  return days.slice(0, count);
}

const today = () => new Date().toISOString().split('T')[0];

export function initialFormState(): FormState {
  return {
    name: '',
    startDate: today(),
    endDate: '',
    isActive: true,
    scheduleMode: 'weekdays',
    weekdays: INITIAL_WEEKDAYS,
    intervalDays: '2',
    cycleLength: '7',
    days: INITIAL_WEEKDAYS.map((wd, i) => ({
      ...defaultDayRow(i),
      name: WEEKDAY_LABELS[wd],
    })),
    countHalfReps: false,
  };
}
