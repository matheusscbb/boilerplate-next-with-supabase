// =============================================================================
// Workout domain types — derived from the database schema and JOIN shape.
// These mirror the Supabase tables exactly (snake_case, same column names).
// =============================================================================

// ─── Primitives ────────────────────────────────────────────────────────────────

export type UserRole = 'trainer' | 'student';

// ─── Schedule types ────────────────────────────────────────────────────────────

export type ScheduleType = 'weekdays' | 'interval' | 'cycle';

export type WeekdaySchedule = {
  type: 'weekdays';
  /** 0 = Sunday … 6 = Saturday (JS Date convention) */
  days: number[];
};

export type IntervalSchedule = {
  type: 'interval';
  interval_days: number;
};

export type CycleSchedule = {
  type: 'cycle';
  cycle_length: number;
};

export type ScheduleConfig = WeekdaySchedule | IntervalSchedule | CycleSchedule;

// ─── Cardio config types ───────────────────────────────────────────────────────

export type DurationCardioConfig = {
  mode: 'duration';
  duration_seconds: number;
};

export type HiitCardioConfig = {
  mode: 'hiit';
  warmup_seconds: number;
  cycles: number;
  work_seconds: number;
  rest_seconds: number;
};

export type CardioConfig = DurationCardioConfig | HiitCardioConfig;

// ─── Row types (single table, no joins) ────────────────────────────────────────

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingPlan {
  id: string;
  student_id: string;
  trainer_id: string;
  name: string;
  start_date: string;       // ISO date string: "YYYY-MM-DD"
  end_date: string | null;  // ISO date string or null (open-ended plan)
  is_active: boolean;
  schedule_type: ScheduleType;
  schedule_config: ScheduleConfig;
  created_at: string;
  updated_at: string;
}

export interface TrainingDay {
  id: string;
  plan_id: string;
  name: string;
  order_index: number;
  created_at: string;
}

/** An exercise instance assigned to a training day inside a plan. */
export interface PlanExercise {
  id: string;
  day_id: string;
  name: string;
  exercise_type: 'strength' | 'cardio';
  // Strength fields (null for cardio)
  sets: number | null;
  reps_range: string | null;
  rest_seconds: number | null;
  // Cardio field (null for strength)
  cardio_config: CardioConfig | null;
  is_completed: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// ─── Joined / expanded types (as returned by Supabase nested selects) ──────────

/** PlanExercise as returned inside a day — no redundant day_id needed. */
export type ExerciseInDay = Omit<PlanExercise, 'day_id'>;

/** Training day with its exercises resolved. */
export interface TrainingDayWithExercises extends Omit<TrainingDay, 'plan_id'> {
  exercises: ExerciseInDay[];
}

/** Profile summary embedded in a plan (avoids exposing the full Profile row). */
export type ProfileSummary = Pick<Profile, 'id' | 'full_name' | 'role'>;

/**
 * Full training plan with nested days, exercises, and profile summaries.
 *
 * This is the shape produced by a Supabase query such as:
 *   supabase
 *     .from('training_plans')
 *     .select(`
 *       *,
 *       student:profiles!student_id(id, full_name, role),
 *       trainer:profiles!trainer_id(id, full_name, role),
 *       days:training_days(
 *         *,
 *         exercises(*)
 *       )
 *     `)
 */
export interface TrainingPlanFull
  extends Omit<TrainingPlan, 'student_id' | 'trainer_id'> {
  student: ProfileSummary;
  trainer: ProfileSummary;
  days: TrainingDayWithExercises[];
}

// ─── RPC payloads ──────────────────────────────────────────────────────────────

/** Argument shape for the mark_exercise_completed RPC. */
export interface MarkExerciseCompletedArgs {
  p_exercise_id: string;
  p_completed: boolean;
}
