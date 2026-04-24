-- Ensure students can call accept_coach_invite via PostgREST (some projects revoke
-- default PUBLIC execute). Align with SECURITY DEFINER + explicit search_path.

CREATE OR REPLACE FUNCTION public.accept_coach_invite(p_token UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

GRANT EXECUTE ON FUNCTION public.accept_coach_invite(uuid) TO authenticated;
