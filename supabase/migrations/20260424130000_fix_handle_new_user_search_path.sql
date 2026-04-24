-- Fix signup: "Database error saving new user" (unexpected_failure).
--
-- handle_new_user() runs as SECURITY DEFINER but, without an explicit search_path,
-- it can inherit the auth session path where unqualified `profiles` / `user_role`
-- do not resolve to public — the INSERT then fails and Auth surfaces a generic error.
--
-- See: https://supabase.com/docs/guides/troubleshooting/dashboard-errors-when-managing-users-N1ls4A

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role;
BEGIN
  v_role := CASE
    WHEN NEW.raw_user_meta_data->>'role' = 'trainer' THEN 'trainer'::user_role
    ELSE 'student'::user_role
  END;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    v_role
  );
  RETURN NEW;
END;
$$;
