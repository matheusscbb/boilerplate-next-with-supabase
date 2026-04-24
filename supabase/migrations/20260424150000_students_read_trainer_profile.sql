-- =============================================================================
-- Let a student read the profile of any trainer whose plan they are assigned to.
-- =============================================================================
-- Symptom this fixes: an assigned student opens /treinos and sees `Sem plano
-- ativo`. The `plan_assignments` row, `training_plans` row and every
-- related `training_days`/`exercises` row are visible to the student
-- thanks to the policies in 20260421 + 20260424100000, but the query embeds
-- `trainer:profiles!trainer_id` and the profiles RLS only exposed:
--   * own profile (id = auth.uid())
--   * every profile when the viewer is a trainer (is_trainer())
--   * a coach's own students (coach_id = auth.uid())
-- There was no corresponding rule letting a student read their trainer's row.
-- The nested embed returned NULL, the fetchActivePlan() code bailed out on
-- `if (!trainer) return null` and the page rendered the empty state.
--
-- A SECURITY DEFINER helper avoids the recursion trap we hit earlier with
-- training_plans (42P17): the policy runs RLS-checked subqueries otherwise.

CREATE OR REPLACE FUNCTION viewer_assigned_to_trainer(p_trainer_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $func$
  SELECT EXISTS (
    SELECT 1
    FROM   plan_assignments pa
    JOIN   training_plans   tp ON tp.id = pa.plan_id
    WHERE  pa.student_id = auth.uid()
      AND  tp.trainer_id = p_trainer_id
  );
$func$;

REVOKE ALL    ON FUNCTION viewer_assigned_to_trainer(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION viewer_assigned_to_trainer(UUID) TO authenticated;

-- Idempotent: this migration may be re-applied on a branch where it already ran.
DROP POLICY IF EXISTS "profiles: student reads own trainers" ON profiles;

CREATE POLICY "profiles: student reads own trainers"
  ON profiles FOR SELECT TO authenticated
  USING (viewer_assigned_to_trainer(profiles.id));