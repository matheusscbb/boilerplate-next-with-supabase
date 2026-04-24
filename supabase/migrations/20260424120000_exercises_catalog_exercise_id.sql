-- Optional link to catalog exercise id (local exerciseDatabase / future exercises_catalog).
ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS catalog_exercise_id text;

COMMENT ON COLUMN exercises.catalog_exercise_id IS
  'When set, matches catalog entry id; name remains the saved label snapshot.';
