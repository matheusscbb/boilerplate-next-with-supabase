import type { ExerciseRow } from '../ExerciseFormRow';
import { defaultExerciseRow } from '../ExerciseFormRow';
import type { DragBindings } from '../_shared/dnd';

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

export type { DragBindings } from '../_shared/dnd';

export interface WorkoutDayBuilderProps extends DragBindings {
  day: DayRow;
  index: number;
  scheduleLabel?: string;
  canRemove?: boolean;
  onUpdate: (updates: Partial<Omit<DayRow, '_id'>>) => void;
  onRemove: () => void;
}
