-- =============================================================================
-- Workout Sessions + Per-Set Weight Logs
-- =============================================================================
-- Run AFTER 20260417000001_plan_scheduling.sql
--
-- Additive migration: no existing column is dropped or altered. The legacy
-- `exercises.is_completed` flag and the `mark_exercise_completed` RPC continue
-- to work. New daily tracking lives in the tables below.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. One active plan per student (idempotent cleanup + unique index)
-- -----------------------------------------------------------------------------
-- Keeps the most recently updated active plan per student, deactivates older
-- duplicates. Safe to re-run.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY student_id
      ORDER BY updated_at DESC, created_at DESC
    ) AS rn
  FROM training_plans
  WHERE is_active = TRUE
)
UPDATE training_plans tp
SET    is_active = FALSE
FROM   ranked r
WHERE  tp.id = r.id
  AND  r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_plan_per_student
  ON training_plans (student_id)
  WHERE is_active = TRUE;


-- -----------------------------------------------------------------------------
-- 2. workout_sessions — one row per plan per calendar date actually opened
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id          UUID        NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  student_id       UUID        NOT NULL REFERENCES profiles(id)       ON DELETE CASCADE,
  training_day_id  UUID        REFERENCES training_days(id)           ON DELETE SET NULL,
  performed_on     DATE        NOT NULL,
  day_observation  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uniq_session_plan_day UNIQUE (plan_id, performed_on)
);

CREATE INDEX IF NOT EXISTS idx_sessions_student_date
  ON workout_sessions (student_id, performed_on);
CREATE INDEX IF NOT EXISTS idx_sessions_plan_date
  ON workout_sessions (plan_id, performed_on);

CREATE TRIGGER trg_workout_sessions_updated_at
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- 3. exercise_logs — one row per exercise performed within a session
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercise_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID        NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id   UUID        NOT NULL REFERENCES exercises(id)        ON DELETE CASCADE,
  observation   TEXT,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uniq_log_per_session_exercise UNIQUE (session_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_exercise
  ON exercise_logs (exercise_id, created_at);

CREATE TRIGGER trg_exercise_logs_updated_at
  BEFORE UPDATE ON exercise_logs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- 4. exercise_set_logs — one row per performed set (reps + weight)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercise_set_logs (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_log_id  UUID          NOT NULL REFERENCES exercise_logs(id) ON DELETE CASCADE,
  set_number       INTEGER       NOT NULL,
  reps             INTEGER,
  weight_kg        NUMERIC(6, 2),
  rpe              NUMERIC(3, 1),
  note             TEXT,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT uniq_set_per_log UNIQUE (exercise_log_id, set_number),
  CONSTRAINT set_number_positive CHECK (set_number >= 1),
  CONSTRAINT reps_positive       CHECK (reps IS NULL OR reps >= 0),
  CONSTRAINT weight_positive     CHECK (weight_kg IS NULL OR weight_kg >= 0),
  CONSTRAINT rpe_range           CHECK (rpe IS NULL OR (rpe >= 0 AND rpe <= 10))
);

CREATE INDEX IF NOT EXISTS idx_set_logs_log
  ON exercise_set_logs (exercise_log_id, set_number);


-- -----------------------------------------------------------------------------
-- 5. Helper: is_plan_editor — did this user design / receive this plan?
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_plan_editor(p_plan_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM training_plans
    WHERE id = p_plan_id
      AND (student_id = auth.uid() OR trainer_id = auth.uid())
  );
$$;


-- -----------------------------------------------------------------------------
-- 6. Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE workout_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_set_logs ENABLE ROW LEVEL SECURITY;


-- ── workout_sessions ────────────────────────────────────────────────────────
CREATE POLICY "sessions: read own or trainer"
  ON workout_sessions FOR SELECT TO authenticated
  USING (is_plan_editor(plan_id));

CREATE POLICY "sessions: insert own or trainer"
  ON workout_sessions FOR INSERT TO authenticated
  WITH CHECK (is_plan_editor(plan_id));

CREATE POLICY "sessions: update own or trainer"
  ON workout_sessions FOR UPDATE TO authenticated
  USING (is_plan_editor(plan_id))
  WITH CHECK (is_plan_editor(plan_id));

CREATE POLICY "sessions: delete own or trainer"
  ON workout_sessions FOR DELETE TO authenticated
  USING (is_plan_editor(plan_id));


-- ── exercise_logs ───────────────────────────────────────────────────────────
CREATE POLICY "exercise_logs: read"
  ON exercise_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = exercise_logs.session_id
        AND is_plan_editor(ws.plan_id)
    )
  );

CREATE POLICY "exercise_logs: write"
  ON exercise_logs FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = exercise_logs.session_id
        AND is_plan_editor(ws.plan_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = exercise_logs.session_id
        AND is_plan_editor(ws.plan_id)
    )
  );


-- ── exercise_set_logs ───────────────────────────────────────────────────────
CREATE POLICY "set_logs: read"
  ON exercise_set_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM exercise_logs    el
      JOIN workout_sessions ws ON ws.id = el.session_id
      WHERE el.id = exercise_set_logs.exercise_log_id
        AND is_plan_editor(ws.plan_id)
    )
  );

CREATE POLICY "set_logs: write"
  ON exercise_set_logs FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM exercise_logs    el
      JOIN workout_sessions ws ON ws.id = el.session_id
      WHERE el.id = exercise_set_logs.exercise_log_id
        AND is_plan_editor(ws.plan_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM exercise_logs    el
      JOIN workout_sessions ws ON ws.id = el.session_id
      WHERE el.id = exercise_set_logs.exercise_log_id
        AND is_plan_editor(ws.plan_id)
    )
  );


-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------
COMMENT ON TABLE workout_sessions IS
  'One row per plan per calendar date when the student or trainer opened/logged a workout.';
COMMENT ON TABLE exercise_logs IS
  'Per-exercise log inside a session. Carries observation + completion timestamp.';
COMMENT ON TABLE exercise_set_logs IS
  'Per-set performance record: reps, weight_kg, optional RPE and note.';
COMMENT ON COLUMN exercise_set_logs.weight_kg IS
  'Weight lifted in kilograms (NUMERIC(6,2)). Preserves historical values for trend analytics.';
