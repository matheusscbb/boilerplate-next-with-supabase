-- =============================================================================
-- Admin Role + User Activation
-- =============================================================================
-- Run AFTER 20260424195000_admin_enum_value.sql
-- ('admin' enum value is added in the previous migration to avoid PostgreSQL's
--  restriction on using a new enum value in the same transaction.)
--
-- Changes:
--   1. Add is_active column to profiles (soft-deactivation).
--   2. Create is_admin() helper function.
--   3. Create trainer_invites table + generate_trainer_invite RPC.
--   4. Admin RLS policies on profiles and trainer_invites.
--   5. Update handle_new_user to recognise 'admin' role from metadata.
--   6. Set user 3cdf9a4c-a1d9-4425-bfcd-f999ad862fe8 as admin.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. is_active column on profiles
-- -----------------------------------------------------------------------------

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;


-- -----------------------------------------------------------------------------
-- 3. is_admin() helper (mirrors is_trainer())
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;


-- -----------------------------------------------------------------------------
-- 4. trainer_invites table — one-shot tokens an admin sends to new trainers
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS trainer_invites (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token       UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_by  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  used_at     TIMESTAMPTZ,
  used_by     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT  trainer_invite_used_pair CHECK (
    (used_at IS NULL AND used_by IS NULL)
    OR (used_at IS NOT NULL AND used_by IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_trainer_invites_created_by ON trainer_invites (created_by);

ALTER TABLE trainer_invites ENABLE ROW LEVEL SECURITY;

-- Admins can read all invites; service functions handle consumption.
CREATE POLICY "trainer_invites: admin all"
  ON trainer_invites FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Anonymous/anon can validate a token during registration (read-only).
-- We use a SECURITY DEFINER function for consumption instead of direct access.


-- -----------------------------------------------------------------------------
-- 5. RPC — generate_trainer_invite (admin-only)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION generate_trainer_invite(
  p_expires_hours INT DEFAULT 168   -- 7 days
)
RETURNS TABLE (id UUID, token UUID, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_admin_id UUID := auth.uid();
BEGIN
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can generate trainer invites';
  END IF;

  RETURN QUERY
  INSERT INTO trainer_invites (created_by, expires_at)
  VALUES (v_admin_id, NOW() + make_interval(hours => p_expires_hours))
  RETURNING trainer_invites.id, trainer_invites.token, trainer_invites.expires_at;
END;
$$;


-- -----------------------------------------------------------------------------
-- 6. RPC — consume_trainer_invite (called after signup with a trainer token)
-- -----------------------------------------------------------------------------
-- Validates the token, sets role=trainer on the new user's profile, marks
-- the invite as consumed. Runs as SECURITY DEFINER to bypass RLS.

CREATE OR REPLACE FUNCTION consume_trainer_invite(p_token UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   UUID := auth.uid();
  v_invite_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO v_invite_id
  FROM   trainer_invites
  WHERE  token     = p_token
    AND  used_at   IS NULL
    AND  expires_at > NOW()
  LIMIT  1;

  IF v_invite_id IS NULL THEN
    RAISE EXCEPTION 'Trainer invite invalid or expired';
  END IF;

  UPDATE profiles
  SET    role = 'trainer'
  WHERE  id = v_user_id;

  UPDATE trainer_invites
  SET    used_at = NOW(),
         used_by = v_user_id
  WHERE  id = v_invite_id;
END;
$$;


-- -----------------------------------------------------------------------------
-- 7. Admin RLS policies on profiles
-- -----------------------------------------------------------------------------

-- Admins can read every profile row.
CREATE POLICY "profiles: admin reads all"
  ON profiles FOR SELECT TO authenticated
  USING (is_admin());

-- Admins can update every profile row (e.g. toggle is_active, change coach_id).
CREATE POLICY "profiles: admin updates all"
  ON profiles FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());


-- -----------------------------------------------------------------------------
-- 8. Update handle_new_user to accept 'admin' role from metadata
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_role user_role;
BEGIN
  v_role := CASE NEW.raw_user_meta_data->>'role'
    WHEN 'trainer' THEN 'trainer'::user_role
    WHEN 'admin'   THEN 'admin'::user_role
    ELSE                'student'::user_role
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
-- 9. Promote user 3cdf9a4c-a1d9-4425-bfcd-f999ad862fe8 to admin
-- -----------------------------------------------------------------------------

UPDATE profiles
SET    role = 'admin'
WHERE  id = '3cdf9a4c-a1d9-4425-bfcd-f999ad862fe8';

UPDATE auth.users
SET    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
WHERE  id = '3cdf9a4c-a1d9-4425-bfcd-f999ad862fe8';
