import { createClient } from '@/infra/supabase/client';
import { buildPayload } from './payload';
import { insertDaysAndExercises } from './insertDaysAndExercises';
import type { FormState } from '../PlanForm.types';

type PlanPayload = ReturnType<typeof buildPayload>;

/**
 * Persists a training plan with its days and exercises.
 *
 * The plan is saved as a reusable template owned by the trainer; attaching
 * students to it happens later through `plan_assignments`.
 *
 * Executes the inserts sequentially and performs a manual rollback (deleting
 * the parent plan, which cascades to days/exercises via FK) on any failure —
 * Supabase's PostgREST does not expose transactions to the client, so this is
 * the closest we can get without a custom RPC.
 */
export async function savePlan(state: FormState): Promise<{ id: string }> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('Usuário não autenticado.');

  const payload: PlanPayload = buildPayload(state);

  // 1. Plan
  const { data: plan, error: planError } = await supabase
    .from('training_plans')
    .insert({
      trainer_id: user.id,
      name: payload.name,
      start_date: payload.start_date,
      end_date: payload.end_date,
      is_active: payload.is_active,
      schedule_type: payload.schedule_type,
      schedule_config: payload.schedule_config,
    })
    .select('id')
    .single();

  if (planError || !plan) {
    throw planError ?? new Error('Falha ao salvar o plano.');
  }

  try {
    await insertDaysAndExercises(supabase, plan.id, payload.days);
    return { id: plan.id };
  } catch (err) {
    await supabase.from('training_plans').delete().eq('id', plan.id);
    throw err;
  }
}

/**
 * Updates plan metadata and replaces all days + exercises (same shape as create).
 */
export async function updatePlan(planId: string, state: FormState): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('Usuário não autenticado.');

  const { data: existing, error: fetchErr } = await supabase
    .from('training_plans')
    .select('id, trainer_id')
    .eq('id', planId)
    .single();

  if (fetchErr || !existing) {
    throw fetchErr ?? new Error('Plano não encontrado.');
  }
  if (existing.trainer_id !== user.id) {
    throw new Error('Sem permissão para editar este plano.');
  }

  const payload: PlanPayload = buildPayload(state);

  const { error: updErr } = await supabase
    .from('training_plans')
    .update({
      name: payload.name,
      start_date: payload.start_date,
      end_date: payload.end_date,
      is_active: payload.is_active,
      schedule_type: payload.schedule_type,
      schedule_config: payload.schedule_config,
    })
    .eq('id', planId);

  if (updErr) throw updErr;

  const { error: delErr } = await supabase
    .from('training_days')
    .delete()
    .eq('plan_id', planId);

  if (delErr) throw delErr;

  await insertDaysAndExercises(supabase, planId, payload.days);
}
