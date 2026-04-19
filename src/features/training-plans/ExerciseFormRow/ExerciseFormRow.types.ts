export type ExerciseMode = 'strength' | 'cardio';
export type CardioMode = 'duration' | 'hiit';

export interface ExerciseRow {
  _id: string;
  catalogId: string;
  name: string;
  mode: ExerciseMode;
  // Strength
  sets: string;
  repsRange: string;
  restSeconds: string;
  // Cardio
  cardioMode: CardioMode;
  durationMinutes: string;
  warmupMinutes: string;
  cycles: string;
  workSeconds: string;
  hiitRestSeconds: string;
}

export function defaultExerciseRow(): ExerciseRow {
  return {
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
  };
}

export interface ExerciseFormRowProps {
  exercise: ExerciseRow;
  index: number;
  onUpdate: (updates: Partial<ExerciseRow>) => void;
  onRemove: () => void;
}
