import type { Exercise } from '@/core/domain';

export interface ExerciseComboboxProps {
  /** Catalog exercise id, or '' if none selected */
  value: string;
  onChange: (id: string, exercise: Exercise | null) => void;
  placeholder?: string;
  disabled?: boolean;
}
