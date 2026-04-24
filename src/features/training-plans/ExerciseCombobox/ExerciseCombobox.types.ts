import type { Exercise } from '@/core/domain';

export interface ExerciseComboboxProps {
  /** Catalog exercise id, or '' if none selected */
  value: string;
  onChange: (id: string, exercise: Exercise | null) => void;
  /**
   * Shown when closed and `value` does not resolve to a catalog row
   * (e.g. custom name from DB or legacy rows without catalog id).
   */
  displayNameFallback?: string;
  placeholder?: string;
  disabled?: boolean;
}
