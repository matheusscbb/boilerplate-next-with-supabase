import type { ExerciseRow } from '../ExerciseFormRow';
import { defaultExerciseRow } from '../ExerciseFormRow';

export interface DayRow {
  _id: string;
  name: string;
  isRestDay: boolean;
  exercises: ExerciseRow[];
}

export function defaultDayRow(index: number): DayRow {
  return {
    _id: crypto.randomUUID(),
    name: `Dia ${String.fromCharCode(65 + index)}`,
    isRestDay: false,
    exercises: [defaultExerciseRow()],
  };
}

export interface WorkoutDayBuilderProps {
  day: DayRow;
  index: number;
  scheduleLabel?: string;
  canRemove?: boolean;
  onUpdate: (updates: Partial<Omit<DayRow, '_id'>>) => void;
  onRemove: () => void;
}
