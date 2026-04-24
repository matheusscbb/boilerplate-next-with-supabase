import type { SupabaseClient } from '@supabase/supabase-js';
import { buildPayload } from './payload';

type PlanPayload = ReturnType<typeof buildPayload>;

/**
 * Inserts training_days + exercises for an existing plan row.
 * Caller is responsible for deleting old days first when replacing.
 */
export async function insertDaysAndExercises(
  supabase: SupabaseClient,
  planId: string,
  days: PlanPayload['days']
): Promise<void> {
  const dayRows = days.map((d) => ({
    plan_id: planId,
    name: d.name,
    order_index: d.order_index,
  }));

  const { data: insertedDays, error: daysError } = await supabase
    .from('training_days')
    .insert(dayRows)
    .select('id, order_index');

  if (daysError || !insertedDays) {
    throw daysError ?? new Error('Falha ao salvar os dias do plano.');
  }

  const dayIdByIndex = new Map<number, string>(
    insertedDays.map((d) => [d.order_index, d.id])
  );

  const exerciseRows = days.flatMap((d) =>
    d.exercises.map((ex) => {
      const dayId = dayIdByIndex.get(d.order_index);
      if (!dayId) {
        throw new Error(
          `Dia recém-inserido não encontrado (order_index=${d.order_index}).`
        );
      }
      return {
        day_id: dayId,
        name: ex.name,
        catalog_exercise_id: ex.catalog_exercise_id,
        exercise_type: ex.exercise_type,
        sets: ex.sets,
        reps_range: ex.reps_range,
        rest_seconds: ex.rest_seconds,
        cardio_config: ex.cardio_config,
        order_index: ex.order_index,
      };
    })
  );

  if (exerciseRows.length > 0) {
    const { error: exError } = await supabase.from('exercises').insert(exerciseRows);
    if (exError) throw exError;
  }
}
