'use client';

import { createClient } from '@/infra/supabase/client';

/**
 * Client-side mutations for the coach-student relationship. Each one returns
 * a typed result and throws on error so callers can surface messages.
 */

export interface CreateInviteResult {
  id: string;
  token: string;
  expires_at: string;
  /** Ready-to-share URL including the origin of the current browser tab. */
  url: string;
}

export async function createInvite(
  expiresHours = 168
): Promise<CreateInviteResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('generate_coach_invite', {
    p_expires_hours: expiresHours,
  });
  if (error) throw error;

  // The RPC returns a setof row; PostgREST delivers it as an array.
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Convite não foi gerado.');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return {
    id: row.id,
    token: row.token,
    expires_at: row.expires_at,
    url: `${origin}/register?invite=${row.token}`,
  };
}

/**
 * Attach a plan to a student and make it their active assignment.
 *
 * Any other active assignment for the same student is deactivated first so
 * the `uniq_active_assignment_per_student` partial index keeps its promise.
 */
export async function assignPlan(input: {
  studentId: string;
  planId: string;
}): Promise<void> {
  const supabase = createClient();

  // Deactivate any other active assignment this student might have.
  const deactivate = await supabase
    .from('plan_assignments')
    .update({ is_active: false })
    .eq('student_id', input.studentId)
    .eq('is_active', true);
  if (deactivate.error) throw deactivate.error;

  // Upsert the target assignment as active.
  const upsert = await supabase
    .from('plan_assignments')
    .upsert(
      {
        student_id: input.studentId,
        plan_id: input.planId,
        is_active: true,
      },
      { onConflict: 'plan_id,student_id' }
    );
  if (upsert.error) throw upsert.error;
}

export async function unassignPlan(input: {
  studentId: string;
  planId: string;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('plan_assignments')
    .delete()
    .eq('student_id', input.studentId)
    .eq('plan_id', input.planId);
  if (error) throw error;
}
