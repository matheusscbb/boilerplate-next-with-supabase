-- =============================================================================
-- Training Plan Scheduling + Exercise Type support
-- =============================================================================
-- Run AFTER 20260417000000_workout_schema.sql
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Scheduling columns on training_plans
-- -----------------------------------------------------------------------------

ALTER TABLE training_plans
  ADD COLUMN schedule_type TEXT NOT NULL DEFAULT 'weekdays'
    CHECK (schedule_type IN ('weekdays', 'interval', 'cycle')),
  ADD COLUMN schedule_config JSONB NOT NULL DEFAULT '{"type":"weekdays","days":[1,3,5]}';

COMMENT ON COLUMN training_plans.schedule_type IS
  'weekdays | interval | cycle';

COMMENT ON COLUMN training_plans.schedule_config IS
  'weekdays: {"type":"weekdays","days":[0..6]}  '
  'interval: {"type":"interval","interval_days":2}  '
  'cycle:    {"type":"cycle","cycle_length":8}';


-- -----------------------------------------------------------------------------
-- 2. Exercise type + cardio config on exercises
-- -----------------------------------------------------------------------------

-- Make strength-specific columns nullable so cardio rows do not need them.
ALTER TABLE exercises
  ALTER COLUMN sets DROP NOT NULL,
  ALTER COLUMN reps_range DROP NOT NULL,
  ALTER COLUMN rest_seconds DROP NOT NULL;

ALTER TABLE exercises
  ADD COLUMN exercise_type TEXT NOT NULL DEFAULT 'strength'
    CHECK (exercise_type IN ('strength', 'cardio')),
  ADD COLUMN cardio_config JSONB;

COMMENT ON COLUMN exercises.exercise_type IS
  'strength | cardio';

COMMENT ON COLUMN exercises.cardio_config IS
  'duration: {"mode":"duration","duration_seconds":1800}  '
  'HIIT:     {"mode":"hiit","warmup_seconds":120,"cycles":10,"work_seconds":40,"rest_seconds":20}';
