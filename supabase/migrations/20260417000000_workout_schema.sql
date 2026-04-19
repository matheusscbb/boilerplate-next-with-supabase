-- =============================================================================
-- Workout App — Database Schema
-- =============================================================================
-- Run sections in order via the Supabase dashboard SQL editor,
-- or push with: supabase db push
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Enum + Helper Function
-- -----------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('trainer', 'student');

-- Reusable helper that returns TRUE when the current JWT belongs to a trainer.
-- SECURITY DEFINER so it runs as the owner and can always read profiles.
CREATE OR REPLACE FUNCTION is_trainer()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'trainer'
  );
$$;


-- -----------------------------------------------------------------------------
-- 2. Tables
-- -----------------------------------------------------------------------------

-- Extends auth.users with role and display name.
-- Created automatically on sign-up via the handle_new_user trigger below.
CREATE TABLE profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role   NOT NULL DEFAULT 'student',
  full_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A training plan belongs to one student and was designed by one trainer.
CREATE TABLE training_plans (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  start_date  DATE        NOT NULL,
  end_date    DATE,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exercises are grouped by "day" inside a plan (e.g. "Dia A — Peito e Tríceps").
CREATE TABLE training_days (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id      UUID        NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  order_index  INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exercises (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id        UUID        NOT NULL REFERENCES training_days(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  sets          INTEGER     NOT NULL,
  reps_range    TEXT        NOT NULL,  -- e.g. "8-12", "6", "até a falha"
  rest_seconds  INTEGER     NOT NULL DEFAULT 60,
  is_completed  BOOLEAN     NOT NULL DEFAULT FALSE,
  order_index   INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- 3. Triggers
-- -----------------------------------------------------------------------------

-- Automatically creates a profile row whenever a new user signs up.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Keeps updated_at accurate on any UPDATE.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_training_plans_updated_at
  BEFORE UPDATE ON training_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- 4. Enable Row Level Security
-- -----------------------------------------------------------------------------

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_days  ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises      ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------------
-- 5. RLS Policies — profiles
-- -----------------------------------------------------------------------------

-- Any authenticated user can read their own profile.
-- Trainers can additionally read all profiles (e.g. to list their students).
CREATE POLICY "profiles: read own or trainer reads all"
  ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_trainer());

-- Users may only update their own profile.
CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- -----------------------------------------------------------------------------
-- 6. RLS Policies — training_plans
-- -----------------------------------------------------------------------------

-- Trainers see all plans; students see only plans where they are the student.
CREATE POLICY "plans: trainer all / student own"
  ON training_plans FOR SELECT TO authenticated
  USING (is_trainer() OR student_id = auth.uid());

-- Only trainers may create plans.
CREATE POLICY "plans: trainer insert"
  ON training_plans FOR INSERT TO authenticated
  WITH CHECK (is_trainer());

-- Only trainers may update plans.
CREATE POLICY "plans: trainer update"
  ON training_plans FOR UPDATE TO authenticated
  USING (is_trainer())
  WITH CHECK (is_trainer());

-- Only trainers may delete plans.
CREATE POLICY "plans: trainer delete"
  ON training_plans FOR DELETE TO authenticated
  USING (is_trainer());


-- -----------------------------------------------------------------------------
-- 7. RLS Policies — training_days
-- -----------------------------------------------------------------------------

-- Trainers see all days; students see only days that belong to their plans.
CREATE POLICY "days: trainer all / student own plan"
  ON training_days FOR SELECT TO authenticated
  USING (
    is_trainer() OR
    EXISTS (
      SELECT 1 FROM training_plans
      WHERE id = training_days.plan_id
        AND student_id = auth.uid()
    )
  );

-- Only trainers may insert, update, or delete days.
CREATE POLICY "days: trainer write"
  ON training_days FOR ALL TO authenticated
  USING (is_trainer())
  WITH CHECK (is_trainer());


-- -----------------------------------------------------------------------------
-- 8. RLS Policies — exercises
-- -----------------------------------------------------------------------------

-- Trainers see all exercises; students see exercises from their own plans.
CREATE POLICY "exercises: trainer all / student own plan"
  ON exercises FOR SELECT TO authenticated
  USING (
    is_trainer() OR
    EXISTS (
      SELECT 1
      FROM training_days  td
      JOIN training_plans tp ON td.plan_id = tp.id
      WHERE td.id = exercises.day_id
        AND tp.student_id = auth.uid()
    )
  );

-- Only trainers may insert, update, or delete exercises directly.
-- Students toggle is_completed via the mark_exercise_completed() RPC below.
CREATE POLICY "exercises: trainer write"
  ON exercises FOR ALL TO authenticated
  USING (is_trainer())
  WITH CHECK (is_trainer());


-- -----------------------------------------------------------------------------
-- 9. RPC — mark_exercise_completed (student-safe gateway)
-- -----------------------------------------------------------------------------
-- Students call this via supabase.rpc('mark_exercise_completed', { p_exercise_id, p_completed }).
-- It runs as SECURITY DEFINER (DB owner) so it bypasses RLS, but it validates
-- ownership itself: only the student assigned to the plan can toggle the flag.

CREATE OR REPLACE FUNCTION mark_exercise_completed(
  p_exercise_id UUID,
  p_completed   BOOLEAN
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_student_id UUID;
BEGIN
  SELECT tp.student_id INTO v_student_id
  FROM   exercises      e
  JOIN   training_days  td ON e.day_id   = td.id
  JOIN   training_plans tp ON td.plan_id = tp.id
  WHERE  e.id = p_exercise_id;

  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Exercise not found';
  END IF;

  IF v_student_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE exercises
  SET    is_completed = p_completed
  WHERE  id = p_exercise_id;
END;
$$;
