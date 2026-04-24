-- =============================================================================
-- Per-set completion tracking on `exercise_set_logs`.
-- =============================================================================
-- Context: the "Treinos" screen lets the student tick a checkbox for each
-- performed set (in addition to the existing per-exercise completion flag).
-- We store that as a timestamp to preserve WHEN the set was marked done and
-- to keep symmetry with `exercise_logs.completed_at`.
--
-- Safe / additive: column is nullable, no default, no data rewrite.
-- =============================================================================

ALTER TABLE exercise_set_logs
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

COMMENT ON COLUMN exercise_set_logs.completed_at IS
  'When the student ticked the "set concluído" checkbox. NULL = not yet completed.';
