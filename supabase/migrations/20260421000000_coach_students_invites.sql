-- =============================================================================
-- Coach ↔ Student relationship + reusable plan templates + invite links
-- =============================================================================
-- Run AFTER 20260420000000_workout_sessions.sql
--
-- Major changes:
--   1. profiles.coach_id self-FK: a student belongs to at most one coach.
--   2. training_plans loses student_id → plans are now reusable templates
--      owned by a trainer and attached to students via plan_assignments.
--   3. coach_invites table + RPCs generate/accept_coach_invite power the
--      signup-by-link flow.
--   4. handle_new_user trigger now reads role from raw_user_meta_data so the
--      signup form can self-select "coach" vs "student".
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0. profiles.coach_id (self-FK) + new RLS policy for coach reading students
-- -----------------------------------------------------------------------------

ALTER TABLE profiles
  ADD COLUMN coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD CONSTRAINT profiles_coach_not_self CHECK (coach_id IS NULL OR coach_id <> id);

CREATE INDEX IF NOT EXISTS idx_profiles_coach_id ON profiles (coach_id);

-- Coaches can read the profile rows of their own students.
-- (The existing "read own or trainer reads all" policy already covers trainers
-- reading any profile, but this is more granular for future hardening.)
CREATE POLICY "profiles: coach reads own students"
  ON profiles FOR SELECT TO authenticated
  USING (coach_id = auth.uid());


-- -----------------------------------------------------------------------------
-- 1. plan_assignments — which students receive which plans
-- -----------------------------------------------------------------------------

CREATE TABLE plan_assignments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id      UUID        NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  student_id   UUID        NOT NULL REFERENCES profiles(id)       ON DELETE CASCADE,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uniq_plan_per_student UNIQUE (plan_id, student_id)
);

CREATE INDEX idx_plan_assignments_student ON plan_assignments (student_id);
CREATE INDEX idx_plan_assignments_plan    ON plan_assignments (plan_id);

-- Replaces the old `uniq_active_plan_per_student` on training_plans:
-- each student can have at most one ACTIVE assignment.
CREATE UNIQUE INDEX uniq_active_assignment_per_student
  ON plan_assignments (student_id)
  WHERE is_active = TRUE;


-- -----------------------------------------------------------------------------
-- 2. Migrate existing training_plans.student_id into plan_assignments,
--    then drop the column and its dependents.
-- -----------------------------------------------------------------------------

-- Copy current pairs first (idempotent thanks to unique constraint).
INSERT INTO plan_assignments (plan_id, student_id, is_active, assigned_at)
SELECT id, student_id, is_active, created_at
FROM   training_plans
ON CONFLICT (plan_id, student_id) DO NOTHING;

-- Drop dependents that reference training_plans.student_id before the column.
DROP INDEX  IF EXISTS uniq_active_plan_per_student;
DROP POLICY IF EXISTS "days: trainer all / student own plan"      ON training_days;
DROP POLICY IF EXISTS "exercises: trainer all / student own plan" ON exercises;
DROP POLICY IF EXISTS "plans: trainer all / student own"          ON training_plans;
-- Old RPC also references training_plans.student_id; drop it — the new daily
-- workout flow uses workout_sessions/exercise_logs instead.
DROP FUNCTION IF EXISTS mark_exercise_completed(UUID, BOOLEAN);

-- `is_plan_editor` is defined in the workout_sessions migration and queries
-- training_plans.student_id. Recreate it to use plan_assignments.
CREATE OR REPLACE FUNCTION is_plan_editor(p_plan_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   training_plans tp
    WHERE  tp.id = p_plan_id
      AND  (
        tp.trainer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM plan_assignments pa
          WHERE  pa.plan_id = tp.id AND pa.student_id = auth.uid()
        )
      )
  );
$$;

ALTER TABLE training_plans DROP COLUMN student_id;

-- Re-create SELECT policy on training_plans using plan_assignments.
CREATE POLICY "plans: trainer all / assigned student reads"
  ON training_plans FOR SELECT TO authenticated
  USING (
    is_trainer()
    OR trainer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM plan_assignments pa
      WHERE  pa.plan_id = training_plans.id
        AND  pa.student_id = auth.uid()
    )
  );


-- -----------------------------------------------------------------------------
-- 3. Re-create days + exercises RLS using plan_assignments
-- -----------------------------------------------------------------------------

CREATE POLICY "days: trainer all / student assigned"
  ON training_days FOR SELECT TO authenticated
  USING (
    is_trainer() OR
    EXISTS (
      SELECT 1
      FROM   plan_assignments pa
      WHERE  pa.plan_id = training_days.plan_id
        AND  pa.student_id = auth.uid()
    )
  );

CREATE POLICY "exercises: trainer all / student assigned"
  ON exercises FOR SELECT TO authenticated
  USING (
    is_trainer() OR
    EXISTS (
      SELECT 1
      FROM   training_days  td
      JOIN   plan_assignments pa ON pa.plan_id = td.plan_id
      WHERE  td.id = exercises.day_id
        AND  pa.student_id = auth.uid()
    )
  );


-- -----------------------------------------------------------------------------
-- 4. workout_sessions: same plan_id + date is valid for multiple students now.
-- -----------------------------------------------------------------------------

ALTER TABLE workout_sessions DROP CONSTRAINT IF EXISTS uniq_session_plan_day;
ALTER TABLE workout_sessions
  ADD CONSTRAINT uniq_session_plan_student_day UNIQUE (plan_id, student_id, performed_on);


-- -----------------------------------------------------------------------------
-- 5. RLS on plan_assignments
-- -----------------------------------------------------------------------------

ALTER TABLE plan_assignments ENABLE ROW LEVEL SECURITY;

-- Owners of the plan (trainer) see every assignment; students see their own.
CREATE POLICY "assignments: trainer or own student reads"
  ON plan_assignments FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM training_plans tp
      WHERE  tp.id = plan_assignments.plan_id
        AND  tp.trainer_id = auth.uid()
    )
  );

-- Only the trainer who owns the plan may assign / unassign / toggle active.
CREATE POLICY "assignments: plan owner writes"
  ON plan_assignments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_plans tp
      WHERE  tp.id = plan_assignments.plan_id
        AND  tp.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_plans tp
      WHERE  tp.id = plan_assignments.plan_id
        AND  tp.trainer_id = auth.uid()
    )
  );


-- -----------------------------------------------------------------------------
-- 6. coach_invites — one-shot tokens a coach sends to a new student
-- -----------------------------------------------------------------------------

CREATE TABLE coach_invites (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token       UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  coach_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  used_by     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT  used_pair CHECK (
    (used_at IS NULL AND used_by IS NULL)
    OR (used_at IS NOT NULL AND used_by IS NOT NULL)
  )
);

CREATE INDEX idx_coach_invites_coach ON coach_invites (coach_id);

ALTER TABLE coach_invites ENABLE ROW LEVEL SECURITY;

-- A coach can read and create their own invites. Consumption goes through the
-- accept_coach_invite() RPC which is SECURITY DEFINER (bypasses RLS).
CREATE POLICY "invites: coach reads own"
  ON coach_invites FOR SELECT TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "invites: coach creates own"
  ON coach_invites FOR INSERT TO authenticated
  WITH CHECK (coach_id = auth.uid() AND is_trainer());


-- -----------------------------------------------------------------------------
-- 7. RPC — generate_coach_invite (caller must be a trainer)
-- -----------------------------------------------------------------------------
-- Returns the fresh token; the client builds the /register?invite=TOKEN URL.

CREATE OR REPLACE FUNCTION generate_coach_invite(
  p_expires_hours INT DEFAULT 168   -- 7 days
)
RETURNS TABLE (id UUID, token UUID, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_coach_id UUID := auth.uid();
BEGIN
  IF v_coach_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = v_coach_id AND role = 'trainer'
  ) THEN
    RAISE EXCEPTION 'Only trainers can generate invites';
  END IF;

  RETURN QUERY
  INSERT INTO coach_invites (coach_id, expires_at)
  VALUES (v_coach_id, NOW() + make_interval(hours => p_expires_hours))
  RETURNING coach_invites.id, coach_invites.token, coach_invites.expires_at;
END;
$$;


-- -----------------------------------------------------------------------------
-- 8. RPC — accept_coach_invite (called by the new student right after signup)
-- -----------------------------------------------------------------------------
-- Validates the token, attaches the caller to the coach, and marks the token
-- as consumed. Runs as the DB owner so it bypasses RLS, but it verifies the
-- caller's identity and the token itself.

CREATE OR REPLACE FUNCTION accept_coach_invite(p_token UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id  UUID := auth.uid();
  v_coach_id UUID;
  v_invite_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id, coach_id
  INTO   v_invite_id, v_coach_id
  FROM   coach_invites
  WHERE  token = p_token
    AND  used_at IS NULL
    AND  expires_at > NOW()
  LIMIT  1;

  IF v_invite_id IS NULL THEN
    RAISE EXCEPTION 'Invite invalid or expired';
  END IF;

  IF v_coach_id = v_user_id THEN
    RAISE EXCEPTION 'Cannot accept your own invite';
  END IF;

  -- Link student → coach and make sure the role is student.
  UPDATE profiles
  SET    coach_id = v_coach_id,
         role     = 'student'
  WHERE  id = v_user_id;

  UPDATE coach_invites
  SET    used_at = NOW(),
         used_by = v_user_id
  WHERE  id = v_invite_id;
END;
$$;


-- -----------------------------------------------------------------------------
-- 9. handle_new_user — now honors role from signup metadata
-- -----------------------------------------------------------------------------
-- The signup form sets user_metadata.role = 'trainer' | 'student'. We only
-- accept 'trainer'; anything else (including missing) defaults to 'student'.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_role user_role;
BEGIN
  v_role := CASE
    WHEN NEW.raw_user_meta_data->>'role' = 'trainer' THEN 'trainer'::user_role
    ELSE 'student'::user_role
  END;

  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    v_role
  );
  RETURN NEW;
END;
$$;


-- -----------------------------------------------------------------------------
-- 10. Bootstrap note (dev-only)
-- -----------------------------------------------------------------------------
-- The currently-logged-in user was created before this migration and is
-- therefore still role='student'. To test the new flow immediately, promote
-- yourself to trainer by running the following in the Supabase SQL editor
-- (replace the email with your own):
--
--   UPDATE profiles
--   SET    role = 'trainer'
--   WHERE  id = (SELECT id FROM auth.users WHERE email = 'you@example.com');
