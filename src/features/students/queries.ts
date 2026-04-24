import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AssignablePlan,
  CoachInviteSummary,
  StudentSummary,
} from './types';

type AnySupabase = SupabaseClient;

/**
 * Return every student currently coached by `coachId`, plus the name of the
 * student's active plan (null when they have no active assignment).
 *
 * One JOIN round-trip keeps the UI render server-side and cheap.
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
    };
  });
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
