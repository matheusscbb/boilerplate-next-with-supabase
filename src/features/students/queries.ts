import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AssignablePlan,
  CoachInviteSummary,
  StudentLatestAssessment,
  StudentSummary,
} from './types';

type AnySupabase = SupabaseClient;

/**
 * Return every student currently coached by `coachId`, plus the name of the
 * student's active plan (null when they have no active assignment) and a
 * snapshot of the most recent body assessment.
 *
 * Two round-trips: one for `profiles + plan_assignments`, one for the latest
 * assessment per student. Fetching assessments in a separate query keeps the
 * SQL simple (PostgREST doesn't expose `DISTINCT ON`) and performs well at
 * realistic coach scales (<a few hundred students × <a few dozen assessments).
 */
export async function listMyStudents(
  supabase: AnySupabase,
  coachId: string
): Promise<StudentSummary[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      full_name,
      created_at,
      assignments:plan_assignments!student_id(
        is_active,
        plan:training_plans!plan_id(name)
      )
      `
    )
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const studentIds = data.map((row) => row.id);
  const latestByStudent = await listLatestAssessmentsByStudents(
    supabase,
    studentIds
  );

  return data.map((row) => {
    const assignments = (row.assignments ?? []) as Array<{
      is_active: boolean;
      plan: { name: string } | Array<{ name: string }> | null;
    }>;
    const active = assignments.find((a) => a.is_active);
    const plan = Array.isArray(active?.plan) ? active?.plan[0] : active?.plan;
    return {
      id: row.id,
      full_name: row.full_name,
      created_at: row.created_at,
      active_plan_name: plan?.name ?? null,
      latest_assessment: latestByStudent.get(row.id) ?? null,
    };
  });
}

/**
 * Fetches the most recent body assessment per student (across the given list).
 * Returned as a Map for O(1) lookups when merging into the students list.
 */
async function listLatestAssessmentsByStudents(
  supabase: AnySupabase,
  studentIds: string[]
): Promise<Map<string, StudentLatestAssessment>> {
  const result = new Map<string, StudentLatestAssessment>();
  if (studentIds.length === 0) return result;

  const { data, error } = await supabase
    .from('body_assessments')
    .select('student_id, performed_on, weight_kg, body_fat_pct, bmi')
    .in('student_id', studentIds)
    .order('performed_on', { ascending: false });

  if (error || !data) return result;

  // Rows are already sorted desc by date — first hit per student wins.
  for (const row of data as Array<
    { student_id: string } & StudentLatestAssessment
  >) {
    if (!result.has(row.student_id)) {
      result.set(row.student_id, {
        performed_on: row.performed_on,
        weight_kg: row.weight_kg,
        body_fat_pct: row.body_fat_pct,
        bmi: row.bmi,
      });
    }
  }
  return result;
}

/** Plans owned by the coach, used to populate the assign-plan picker. */
export async function listMyPlans(
  supabase: AnySupabase,
  coachId: string
): Promise<AssignablePlan[]> {
  const { data, error } = await supabase
    .from('training_plans')
    .select('id, name, is_active')
    .eq('trainer_id', coachId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
}

/** Active invite links from this coach that are not used/expired yet. */
export async function listMyActiveInvites(
  supabase: AnySupabase,
  coachId: string
): Promise<CoachInviteSummary[]> {
  const { data, error } = await supabase
    .from('coach_invites')
    .select('id, token, created_at, expires_at')
    .eq('coach_id', coachId)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
}
