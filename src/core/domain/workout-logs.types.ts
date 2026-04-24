// =============================================================================
// Workout log domain types — mirror the workout_sessions / exercise_logs /
// exercise_set_logs tables (see 20260420000000_workout_sessions.sql).
// =============================================================================

export interface WorkoutSession {
  id: string;
  plan_id: string;
  student_id: string;
  training_day_id: string | null;
  performed_on: string; // ISO date "YYYY-MM-DD"
  day_observation: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseLog {
  id: string;
  session_id: string;
  exercise_id: string;
  observation: string | null;
  completed_at: string | null; // ISO timestamp or null
  created_at: string;
  updated_at: string;
}

export interface ExerciseSetLog {
  id: string;
  exercise_log_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  rpe: number | null;
  note: string | null;
  /** When the student ticked "série concluída". NULL = not yet. */
  completed_at: string | null;
  created_at: string;
}

/** ExerciseLog with its set logs nested (as returned by Supabase nested selects). */
export interface ExerciseLogWithSets extends ExerciseLog {
  sets: ExerciseSetLog[];
}

/** Session with its exercise logs resolved. Useful for the daily panel. */
export interface WorkoutSessionFull extends WorkoutSession {
  logs: ExerciseLogWithSets[];
}

/**
 * Month summary row returned by `workout_sessions` range queries to build
 * calendar markers without fetching nested log data.
 */
export interface WorkoutSessionSummary {
  id: string;
  performed_on: string;
  training_day_id: string | null;
  has_logs: boolean;
}
