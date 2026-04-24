-- Fix ambiguous "id" reference in generate_coach_invite().
-- In PL/pgSQL, RETURNS TABLE column names are variables in scope, so
-- unqualified "id" can conflict with table columns.

CREATE OR REPLACE FUNCTION generate_coach_invite(
  p_expires_hours INT DEFAULT 168
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
    SELECT 1
    FROM profiles
    WHERE profiles.id = v_coach_id
      AND profiles.role = 'trainer'
  ) THEN
    RAISE EXCEPTION 'Only trainers can generate invites';
  END IF;

  RETURN QUERY
  INSERT INTO coach_invites (coach_id, expires_at)
  VALUES (v_coach_id, NOW() + make_interval(hours => p_expires_hours))
  RETURNING coach_invites.id, coach_invites.token, coach_invites.expires_at;
END;
$$;
