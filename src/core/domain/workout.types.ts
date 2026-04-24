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
  /** Only meaningful for students: self-FK to the trainer's profile. */
  coach_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * A training plan is a reusable template owned by a trainer. Students are
 * attached through `plan_assignments` rather than directly on this row.
 */
export interface TrainingPlan {
  id: string;
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

/** Attachment row linking a plan to a student. */
export interface PlanAssignment {
  id: string;
  plan_id: string;
  student_id: string;
  is_active: boolean;
  assigned_at: string;
}

/** One-shot invite token a coach generates to bring a student on board. */
export interface CoachInvite {
  id: string;
  token: string;
  coach_id: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
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
  /** Optional catalog id (e.g. exerciseDatabase / exercises_catalog). */
  catalog_exercise_id: string | null;
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
 *       trainer:profiles!trainer_id(id, full_name, role),
 *       assignments:plan_assignments(
 *         student:profiles!student_id(id, full_name, role)
 *       ),
 *       days:training_days(
 *         *,
 *         exercises(*)
 *       )
 *     `)
 */
export interface TrainingPlanFull extends Omit<TrainingPlan, 'trainer_id'> {
  trainer: ProfileSummary;
  /** The student viewing the plan (populated when queried from a student context). */
  student?: ProfileSummary;
  days: TrainingDayWithExercises[];
}

// ─── RPC payloads ──────────────────────────────────────────────────────────────

/** Argument shape for the mark_exercise_completed RPC. */
export interface MarkExerciseCompletedArgs {
  p_exercise_id: string;
  p_completed: boolean;
}
