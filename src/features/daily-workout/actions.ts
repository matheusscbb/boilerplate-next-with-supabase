'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/infra/supabase/server';
import { resolveScheduledDay } from './helpers/resolveScheduledDay';
import type { TrainingPlanFull } from '@/core/domain';

// =============================================================================
// Shared helpers (RLS is already enforced at the DB level; these guards add
// defense-in-depth and surface nicer errors to the client.)
// =============================================================================

async function requireUser() {
  const supabase = await createClient();
  const { data: auth, error } = await supabase.auth.getUser();
  if (error || !auth?.user) throw new Error('Não autenticado');
  return { supabase, userId: auth.user.id };
}

async function assertPlanEditor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  planId: string,
  userId: string
) {
  const { data: plan, error } = await supabase
    .from('training_plans')
    .select('trainer_id')
    .eq('id', planId)
    .single();
  if (error || !plan) throw new Error('Plano não encontrado');
  if (plan.trainer_id === userId) return;

  // Not the trainer — must be an assigned student.
  const { data: assignment } = await supabase
    .from('plan_assignments')
    .select('id')
    .eq('plan_id', planId)
    .eq('student_id', userId)
    .maybeSingle();
  if (!assignment) {
    throw new Error('Sem permissão para editar este plano');
  }
}

async function assertSessionEditor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('plan_id')
    .eq('id', sessionId)
    .single();
  if (error || !data) throw new Error('Sessão não encontrada');
  await assertPlanEditor(supabase, data.plan_id, userId);
  return data.plan_id as string;
}

// =============================================================================
// Session: get or create for a given plan + date, resolving the scheduled
// training_day automatically so analytics stay consistent later.
// =============================================================================

export async function upsertWorkoutSession(input: {
  planId: string;
  performedOn: string; // ISO YYYY-MM-DD
}): Promise<{ id: string; training_day_id: string | null }> {
  const { supabase, userId } = await requireUser();
  await assertPlanEditor(supabase, input.planId, userId);

  // Existing session?
  const existing = await supabase
    .from('workout_sessions')
    .select('id, training_day_id')
    .eq('plan_id', input.planId)
    .eq('performed_on', input.performedOn)
    .maybeSingle();
  if (existing.data) {
    return { id: existing.data.id, training_day_id: existing.data.training_day_id };
  }

  // Resolve the scheduled training_day on the server for consistency.
  const planRes = await supabase
    .from('training_plans')
    .select(
      `
      start_date, end_date, schedule_config,
      days:training_days(id, name, order_index)
      `
    )
    .eq('id', input.planId)
    .single();
  if (planRes.error || !planRes.data) throw new Error('Falha ao carregar plano');

  const planForResolver: Pick<
    TrainingPlanFull,
    'start_date' | 'end_date' | 'schedule_config' | 'days'
  > = {
    start_date: planRes.data.start_date,
    end_date: planRes.data.end_date,
    schedule_config: planRes.data.schedule_config as TrainingPlanFull['schedule_config'],
    days: (planRes.data.days as Array<{ id: string; name: string; order_index: number }>).map(
      (d) => ({ id: d.id, name: d.name, order_index: d.order_index, created_at: '', exercises: [] })
    ),
  };
  const resolved = resolveScheduledDay(planForResolver, input.performedOn);

  // The caller is always the student executing the workout; the /treinos page
  // is the only entry point for this action today. Trainers watching a
  // student's sessions don't create them.
  const insertRes = await supabase
    .from('workout_sessions')
    .insert({
      plan_id: input.planId,
      student_id: userId,
      performed_on: input.performedOn,
      training_day_id: resolved?.day.id ?? null,
    })
    .select('id, training_day_id')
    .single();
  if (insertRes.error || !insertRes.data) throw new Error(insertRes.error?.message ?? 'Falha ao criar sessão');

  revalidatePath('/treinos');
  return { id: insertRes.data.id, training_day_id: insertRes.data.training_day_id };
}

// =============================================================================
// Exercise log: upsert row by (session_id, exercise_id) and edit observation
// or completion.
// =============================================================================

export async function ensureExerciseLog(input: {
  sessionId: string;
  exerciseId: string;
}): Promise<{ id: string }> {
  const { supabase, userId } = await requireUser();
  await assertSessionEditor(supabase, input.sessionId, userId);

  const existing = await supabase
    .from('exercise_logs')
    .select('id')
    .eq('session_id', input.sessionId)
    .eq('exercise_id', input.exerciseId)
    .maybeSingle();
  if (existing.data) return { id: existing.data.id };

  const created = await supabase
    .from('exercise_logs')
    .insert({
      session_id: input.sessionId,
      exercise_id: input.exerciseId,
    })
    .select('id')
    .single();
  if (created.error || !created.data) throw new Error(created.error?.message ?? 'Falha ao criar log');
  return { id: created.data.id };
}

export async function saveExerciseObservation(input: {
  exerciseLogId: string;
  observation: string;
}): Promise<void> {
  const { supabase, userId } = await requireUser();
  const { data: log, error } = await supabase
    .from('exercise_logs')
    .select('session_id')
    .eq('id', input.exerciseLogId)
    .single();
  if (error || !log) throw new Error('Log não encontrado');
  await assertSessionEditor(supabase, log.session_id, userId);

  const res = await supabase
    .from('exercise_logs')
    .update({ observation: input.observation || null })
    .eq('id', input.exerciseLogId);
  if (res.error) throw new Error(res.error.message);
}

export async function toggleExerciseCompleted(input: {
  exerciseLogId: string;
  completed: boolean;
}): Promise<{ completed_at: string | null }> {
  const { supabase, userId } = await requireUser();
  const { data: log, error } = await supabase
    .from('exercise_logs')
    .select('session_id')
    .eq('id', input.exerciseLogId)
    .single();
  if (error || !log) throw new Error('Log não encontrado');
  await assertSessionEditor(supabase, log.session_id, userId);

  const completed_at = input.completed ? new Date().toISOString() : null;
  const res = await supabase
    .from('exercise_logs')
    .update({ completed_at })
    .eq('id', input.exerciseLogId);
  if (res.error) throw new Error(res.error.message);
  return { completed_at };
}

// =============================================================================
// Set logs — upsert / delete one at a time. Batches are handled by the
// client firing multiple parallel calls; RLS makes it safe.
// =============================================================================

export interface SetLogInput {
  exerciseLogId: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  rpe?: number | null;
  note?: string | null;
  /** ISO timestamp when the set was ticked as done; null = not completed. */
  completedAt?: string | null;
}

export async function saveSetLog(input: SetLogInput): Promise<{
  id: string;
  completed_at: string | null;
}> {
  const { supabase, userId } = await requireUser();
  const { data: log, error } = await supabase
    .from('exercise_logs')
    .select('session_id')
    .eq('id', input.exerciseLogId)
    .single();
  if (error || !log) throw new Error('Log não encontrado');
  await assertSessionEditor(supabase, log.session_id, userId);

  // We always upsert the full row shape (onConflict replaces the existing
  // tuple), so every writable column must be included here — otherwise a
  // previously-saved value (e.g. `completed_at`) would be silently wiped.
  const res = await supabase
    .from('exercise_set_logs')
    .upsert(
      {
        exercise_log_id: input.exerciseLogId,
        set_number: input.setNumber,
        reps: input.reps,
        weight_kg: input.weightKg,
        rpe: input.rpe ?? null,
        note: input.note ?? null,
        completed_at: input.completedAt ?? null,
      },
      { onConflict: 'exercise_log_id,set_number' }
    )
    .select('id, completed_at')
    .single();
  if (res.error || !res.data) throw new Error(res.error?.message ?? 'Falha ao salvar série');
  return { id: res.data.id, completed_at: res.data.completed_at };
}

export async function deleteSetLog(input: { id: string }): Promise<void> {
  const { supabase, userId } = await requireUser();
  const { data: row, error } = await supabase
    .from('exercise_set_logs')
    .select('exercise_log_id')
    .eq('id', input.id)
    .single();
  if (error || !row) throw new Error('Série não encontrada');

  const { data: log } = await supabase
    .from('exercise_logs')
    .select('session_id')
    .eq('id', row.exercise_log_id)
    .single();
  if (!log) throw new Error('Log não encontrado');
  await assertSessionEditor(supabase, log.session_id, userId);

  const res = await supabase.from('exercise_set_logs').delete().eq('id', input.id);
  if (res.error) throw new Error(res.error.message);
}

// =============================================================================
// Day observation
// =============================================================================

export async function saveDayObservation(input: {
  sessionId: string;
  observation: string;
}): Promise<void> {
  const { supabase, userId } = await requireUser();
  await assertSessionEditor(supabase, input.sessionId, userId);

  const res = await supabase
    .from('workout_sessions')
    .update({ day_observation: input.observation || null })
    .eq('id', input.sessionId);
  if (res.error) throw new Error(res.error.message);
}
