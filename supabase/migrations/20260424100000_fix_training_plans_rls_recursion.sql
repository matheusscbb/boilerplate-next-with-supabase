-- Fix 42P17 "infinite recursion detected in policy for relation training_plans".
--
-- The SELECT policy on training_plans referenced plan_assignments, while
-- plan_assignments policies referenced training_plans — PostgreSQL RLS then
-- cycles forever. SECURITY DEFINER helpers read those tables as the function
-- owner (bypassing RLS) while still comparing against auth.uid().

CREATE OR REPLACE FUNCTION trainer_owns_plan(p_plan_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM training_plans tp
    WHERE tp.id = p_plan_id
      AND tp.trainer_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION student_assigned_to_plan(p_plan_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM plan_assignments pa
    WHERE pa.plan_id = p_plan_id
      AND pa.student_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION trainer_owns_plan(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION student_assigned_to_plan(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION trainer_owns_plan(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION student_assigned_to_plan(UUID) TO authenticated;

DROP POLICY IF EXISTS "assignments: trainer or own student reads" ON plan_assignments;
DROP POLICY IF EXISTS "assignments: plan owner writes" ON plan_assignments;

CREATE POLICY "assignments: trainer or own student reads"
  ON plan_assignments FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR trainer_owns_plan(plan_id)
  );

CREATE POLICY "assignments: plan owner writes"
  ON plan_assignments FOR ALL TO authenticated
  USING (trainer_owns_plan(plan_id))
  WITH CHECK (trainer_owns_plan(plan_id));

DROP POLICY IF EXISTS "plans: trainer all / assigned student reads" ON training_plans;

CREATE POLICY "plans: trainer all / assigned student reads"
  ON training_plans FOR SELECT TO authenticated
  USING (
    is_trainer()
    OR trainer_id = auth.uid()
    OR student_assigned_to_plan(training_plans.id)
  );
