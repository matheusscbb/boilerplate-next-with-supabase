// =============================================================================
// Exercise Catalog — domain types
//
// These types describe exercises as entries in a catalog/library.
// The local implementation lives in src/shared/constants/exerciseDatabase.ts
// and can be replaced by a Supabase query when the table is created.
// =============================================================================

export type ExerciseCategory =
  | 'Peito'
  | 'Costas'
  | 'Ombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Antebraço'
  | 'Quadríceps'
  | 'Posterior'
  | 'Glúteos'
  | 'Panturrilha'
  | 'Abdômen'
  | 'Cardio'
  | 'Corpo inteiro';

/** Determines which form fields are displayed for the exercise. */
export type ExerciseType = 'strength' | 'cardio';

export type Exercise = {
  id: string;
  name: string;
  category: ExerciseCategory;
  /** Hidden type that controls form field layout. Defaults to "strength". */
  type: ExerciseType;
};
