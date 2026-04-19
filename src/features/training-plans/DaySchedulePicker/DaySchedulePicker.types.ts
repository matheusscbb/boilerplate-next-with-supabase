export type ScheduleMode = 'weekdays' | 'interval' | 'cycle';

export interface DaySchedulePickerProps {
  mode: ScheduleMode;
  weekdays: number[];
  intervalDays: string;
  cycleLength: string;
  onModeChange: (mode: ScheduleMode) => void;
  onWeekdaysChange: (days: number[]) => void;
  onIntervalDaysChange: (value: string) => void;
  onCycleLengthChange: (value: string) => void;
}
