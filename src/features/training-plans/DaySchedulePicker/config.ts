import type { ScheduleMode } from './DaySchedulePicker.types';

export const WEEKDAYS = [
  { label: 'Dom', value: 0 },
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 },
] as const;

export const MODES: { value: ScheduleMode; label: string }[] = [
  { value: 'weekdays', label: 'Dias da semana' },
  { value: 'interval', label: 'A cada X dias' },
  { value: 'cycle', label: 'Ciclo personalizado' },
];
