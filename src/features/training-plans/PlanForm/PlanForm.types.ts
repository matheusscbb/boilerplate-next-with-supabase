import type { ScheduleMode } from '../DaySchedulePicker';
import type { DayRow } from '../WorkoutDayBuilder';

export interface FormState {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  scheduleMode: ScheduleMode;
  weekdays: number[];
  intervalDays: string;
  cycleLength: string;
  days: DayRow[];
  countHalfReps: boolean;
}

export interface MuscleVolume {
  direct: number;
  indirect: number;
}
