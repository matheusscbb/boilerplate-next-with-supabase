import type { CardioConfig, ScheduleConfig } from '@/core/domain';
import type { FormState } from '../PlanForm.types';

export function buildScheduleConfig(state: FormState): ScheduleConfig {
  switch (state.scheduleMode) {
    case 'weekdays':
      return { type: 'weekdays', days: state.weekdays };
    case 'interval':
      return {
        type: 'interval',
        interval_days: parseInt(state.intervalDays) || 2,
      };
    case 'cycle':
      return {
        type: 'cycle',
        cycle_length: parseInt(state.cycleLength) || 7,
      };
  }
}

export function buildPayload(state: FormState) {
  return {
    name: state.name,
    start_date: state.startDate,
    end_date: state.endDate || null,
    is_active: state.isActive,
    schedule_type: state.scheduleMode,
    schedule_config: buildScheduleConfig(state),
    days: state.days.map((day, dayIdx) => ({
      name: day.name,
      order_index: dayIdx,
      exercises: day.exercises.map((ex, exIdx) => {
        if (ex.mode === 'strength') {
          return {
            name: ex.name,
            catalog_exercise_id: ex.catalogId.trim() || null,
            exercise_type: 'strength' as const,
            sets: parseInt(ex.sets) || 3,
            reps_range: ex.repsRange,
            rest_seconds: parseInt(ex.restSeconds) || 60,
            cardio_config: null,
            order_index: exIdx,
          };
        }

        const cardioConfig: CardioConfig =
          ex.cardioMode === 'hiit'
            ? {
                mode: 'hiit',
                warmup_seconds: (parseInt(ex.warmupMinutes) || 5) * 60,
                cycles: parseInt(ex.cycles) || 10,
                work_seconds: parseInt(ex.workSeconds) || 40,
                rest_seconds: parseInt(ex.hiitRestSeconds) || 20,
              }
            : {
                mode: 'duration',
                duration_seconds: (parseInt(ex.durationMinutes) || 30) * 60,
              };

        return {
          name: ex.name,
          catalog_exercise_id: ex.catalogId.trim() || null,
          exercise_type: 'cardio' as const,
          sets: null,
          reps_range: null,
          rest_seconds: null,
          cardio_config: cardioConfig,
          order_index: exIdx,
        };
      }),
    })),
  };
}
