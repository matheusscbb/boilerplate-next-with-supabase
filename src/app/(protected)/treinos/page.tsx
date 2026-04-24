import { createClient } from '@/infra/supabase/server';
import { DailyWorkoutPanel } from '@/features/daily-workout';
import {
  endOfMonthISO,
  startOfMonthISO,
  todayISO,
} from '@/features/daily-workout';
import type {
  CardioConfig,
  ScheduleConfig,
  TrainingPlanFull,
  WorkoutSessionFull,
  WorkoutSessionSummary,
} from '@/core/domain';

// Always render fresh; this page is per-user + per-date and highly dynamic.
export const dynamic = 'force-dynamic';

// ─── Query helpers ─────────────────────────────────────────────────────────

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function fetchActivePlan(
  supabase: Supabase,
  userId: string
): Promise<TrainingPlanFull | null> {
  // The student's active plan is resolved through plan_assignments. The
  // `uniq_active_assignment_per_student` partial index guarantees at most one
  // row here.
  const { data, error } = await supabase
    .from('plan_assignments')
    .select(
      `
      student:profiles!student_id(id, full_name, role),
      plan:training_plans!plan_id(
        id,
        trainer_id,
        name,
        start_date,
        end_date,
        is_active,
        schedule_type,
        schedule_config,
        created_at,
        updated_at,
        trainer:profiles!trainer_id(id, full_name, role),
        days:training_days(
          id,
          name,
          order_index,
          created_at,
          exercises(*)
        )
      )
      `
    )
    .eq('student_id', userId)
    .eq('is_active', true)
    .order('order_index', {
      foreignTable: 'plan.days',
      ascending: true,
    })
    .order('order_index', {
      foreignTable: 'plan.days.exercises',
      ascending: true,
    })
    .maybeSingle();

  if (error || !data) return null;

  const rawStudent = data.student as
    | { id: string; full_name: string | null; role: 'trainer' | 'student' }
    | Array<{ id: string; full_name: string | null; role: 'trainer' | 'student' }>
    | null;
  const student = Array.isArray(rawStudent) ? rawStudent[0] : rawStudent;

  const rawPlan = data.plan as
    | PlanRow
    | Array<PlanRow>
    | null;
  const plan = Array.isArray(rawPlan) ? rawPlan[0] : rawPlan;
  if (!plan || !student) return null;

  const rawTrainer = plan.trainer as
    | { id: string; full_name: string | null; role: 'trainer' | 'student' }
    | Array<{ id: string; full_name: string | null; role: 'trainer' | 'student' }>
    | null;
  const trainer = Array.isArray(rawTrainer) ? rawTrainer[0] : rawTrainer;
  if (!trainer) return null;

  return {
    id: plan.id,
    name: plan.name,
    start_date: plan.start_date,
    end_date: plan.end_date,
    is_active: plan.is_active,
    schedule_type: plan.schedule_type,
    schedule_config: plan.schedule_config as ScheduleConfig,
    created_at: plan.created_at,
    updated_at: plan.updated_at,
    student,
    trainer,
    days: (plan.days ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      order_index: d.order_index,
      created_at: d.created_at,
      exercises: (d.exercises ?? []).map((ex) => ({
        id: ex.id,
        name: ex.name,
        catalog_exercise_id: ex.catalog_exercise_id ?? null,
        exercise_type: ex.exercise_type as 'strength' | 'cardio',
        sets: ex.sets,
        reps_range: ex.reps_range,
        rest_seconds: ex.rest_seconds,
        cardio_config: ex.cardio_config as CardioConfig | null,
        is_completed: ex.is_completed,
        order_index: ex.order_index,
        created_at: ex.created_at,
        updated_at: ex.updated_at,
      })),
    })),
  };
}

type PlanRow = {
  id: string;
  trainer_id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  schedule_type: 'weekdays' | 'interval' | 'cycle';
  schedule_config: unknown;
  created_at: string;
  updated_at: string;
  trainer:
    | { id: string; full_name: string | null; role: 'trainer' | 'student' }
    | Array<{ id: string; full_name: string | null; role: 'trainer' | 'student' }>
    | null;
  days: Array<{
    id: string;
    name: string;
    order_index: number;
    created_at: string;
    exercises: Array<{
      id: string;
      name: string;
      catalog_exercise_id?: string | null;
      exercise_type: string;
      sets: number | null;
      reps_range: string | null;
      rest_seconds: number | null;
      cardio_config: unknown;
      is_completed: boolean;
      order_index: number;
      created_at: string;
      updated_at: string;
    }>;
  }>;
};

async function fetchMonthSessionSummaries(
  supabase: Supabase,
  planId: string,
  studentId: string,
  monthISO: string
): Promise<WorkoutSessionSummary[]> {
  const start = startOfMonthISO(monthISO);
  const end = endOfMonthISO(monthISO);

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, performed_on, training_day_id, exercise_logs:exercise_logs(id)')
    .eq('plan_id', planId)
    .eq('student_id', studentId)
    .gte('performed_on', start)
    .lte('performed_on', end);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    performed_on: row.performed_on,
    training_day_id: row.training_day_id,
    has_logs: Array.isArray(row.exercise_logs) && row.exercise_logs.length > 0,
  }));
}

async function fetchSessionForDate(
  supabase: Supabase,
  planId: string,
  studentId: string,
  performedOn: string
): Promise<WorkoutSessionFull | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(
      `
      id,
      plan_id,
      student_id,
      training_day_id,
      performed_on,
      day_observation,
      created_at,
      updated_at,
      logs:exercise_logs(
        id,
        session_id,
        exercise_id,
        observation,
        completed_at,
        created_at,
        updated_at,
        sets:exercise_set_logs(
          id,
          exercise_log_id,
          set_number,
          reps,
          weight_kg,
          rpe,
          note,
          completed_at,
          created_at
        )
      )
      `
    )
    .eq('plan_id', planId)
    .eq('student_id', studentId)
    .eq('performed_on', performedOn)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as WorkoutSessionFull;
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function TreinosPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const today = todayISO();
  const selectedDate = isValidISO(date) ? date! : today;
  const monthISO = startOfMonthISO(selectedDate);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) {
    // Protected layout already redirects; this is a defensive fallback.
    return null;
  }

  const [{ data: profileRow }, plan] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', userId).maybeSingle(),
    fetchActivePlan(supabase, userId),
  ]);

  let monthSessions: WorkoutSessionSummary[] = [];
  let selectedSession: WorkoutSessionFull | null = null;
  if (plan) {
    [monthSessions, selectedSession] = await Promise.all([
      fetchMonthSessionSummaries(supabase, plan.id, userId, monthISO),
      fetchSessionForDate(supabase, plan.id, userId, selectedDate),
    ]);
  }

  return (
    <DailyWorkoutPanel
      plan={plan}
      selectedDate={selectedDate}
      today={today}
      monthISO={monthISO}
      monthSessions={monthSessions}
      selectedSession={selectedSession}
      emptyPlanCoachHint={profileRow?.role === 'trainer'}
    />
  );
}

function isValidISO(v: string | undefined): v is string {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
}
