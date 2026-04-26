-- =============================================================================
-- Body Assessments — Anthropometric tracking with multi-protocol support
-- =============================================================================
-- Run AFTER 20260424210000_trainer_license_expiry.sql
--
-- Stores periodic anthropometric evaluations performed by a trainer on a
-- student. Supports two assessment types:
--   1. bioimpedance  → trainer types in the device-reported values directly
--   2. skinfold      → trainer enters skinfold measurements; the application
--                       computes body fat % using the chosen protocol:
--                       pollock_3 | pollock_7 | guedes | faulkner
--
-- Design notes:
--   • All raw inputs are stored in dedicated columns (one column per anatomical
--     site) so we can run analytics directly in SQL without parsing JSON.
--   • Computed metrics (bmi, body_fat_pct, lean_mass_kg, fat_mass_kg) are also
--     persisted. Trainers see hundreds of rows in the history; recomputing
--     them on every page load is wasteful.
--   • Photos live in a dedicated table + private Storage bucket so we can
--     evolve them without touching the main row.
--   • RLS: a trainer reads/writes assessments they authored for THEIR students;
--     students read their own assessments (no write); admins read everything.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Enums
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE assessment_type AS ENUM ('bioimpedance', 'skinfold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE skinfold_protocol AS ENUM (
    'pollock_3',
    'pollock_7',
    'guedes',
    'faulkner'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE assessment_sex AS ENUM ('male', 'female');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE assessment_photo_position AS ENUM ('front', 'back', 'left', 'right');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- -----------------------------------------------------------------------------
-- 2. body_assessments — one row per evaluation
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS body_assessments (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id        UUID            NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id        UUID            NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  performed_on      DATE            NOT NULL DEFAULT CURRENT_DATE,
  assessment_type   assessment_type NOT NULL,
  protocol          skinfold_protocol,                       -- NULL when bioimpedance

  -- Snapshotted at assessment time so historical calculations stay reproducible
  sex               assessment_sex,
  birth_date        DATE,

  -- Composition: weight + height are required for BMI / mass derivations
  weight_kg         NUMERIC(5,2),
  height_cm         NUMERIC(5,2),

  -- Skinfolds in millimetres. Only the columns needed by the chosen protocol
  -- are filled; every column is nullable on purpose.
  skf_chest_mm        NUMERIC(5,2),  -- Pollock 3 (M) / Pollock 7
  skf_abdomen_mm      NUMERIC(5,2),  -- Pollock 3 (M) / Pollock 7 / Faulkner
  skf_thigh_mm        NUMERIC(5,2),  -- Pollock 3 / Pollock 7 / Guedes (F)
  skf_triceps_mm      NUMERIC(5,2),  -- Pollock 3 (F) / Pollock 7 / Guedes (M) / Faulkner
  skf_subscapular_mm  NUMERIC(5,2),  -- Pollock 7 / Guedes / Faulkner
  skf_suprailiac_mm   NUMERIC(5,2),  -- Pollock 3 (F) / Pollock 7 / Guedes / Faulkner
  skf_axillary_mm     NUMERIC(5,2),  -- Pollock 7
  skf_calf_mm         NUMERIC(5,2),  -- reserved for future protocols

  -- Bioimpedance direct readings (kept separate from computed columns so we
  -- can tell measured vs. derived values apart later)
  bia_body_fat_pct  NUMERIC(5,2),
  bia_lean_mass_kg  NUMERIC(5,2),
  bia_fat_mass_kg   NUMERIC(5,2),

  -- Perimeters (cm). Both arms / thighs / calves split for asymmetry analysis.
  perim_neck_cm     NUMERIC(5,2),
  perim_shoulders_cm NUMERIC(5,2),
  perim_chest_cm    NUMERIC(5,2),
  perim_arm_left_cm   NUMERIC(5,2),
  perim_arm_right_cm  NUMERIC(5,2),
  perim_waist_cm    NUMERIC(5,2),
  perim_abdomen_cm  NUMERIC(5,2),
  perim_hip_cm      NUMERIC(5,2),
  perim_thigh_left_cm  NUMERIC(5,2),
  perim_thigh_right_cm NUMERIC(5,2),
  perim_calf_left_cm   NUMERIC(5,2),
  perim_calf_right_cm  NUMERIC(5,2),

  -- Persisted derived metrics. Filled by the application on insert/update.
  -- Storing them avoids recomputing across the whole history on every list view.
  bmi               NUMERIC(5,2),
  body_density      NUMERIC(7,5),    -- audit value for skinfold protocols
  body_fat_pct      NUMERIC(5,2),
  lean_mass_kg      NUMERIC(5,2),
  fat_mass_kg       NUMERIC(5,2),

  notes             TEXT,

  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT body_assessments_self_block
    CHECK (student_id <> trainer_id),

  -- Skinfold rows must declare a protocol; bioimpedance must NOT.
  CONSTRAINT body_assessments_protocol_match CHECK (
    (assessment_type = 'skinfold'     AND protocol IS NOT NULL) OR
    (assessment_type = 'bioimpedance' AND protocol IS NULL)
  ),

  -- Sanity guards (no negative values; reasonable upper bounds)
  CONSTRAINT body_assessments_weight_range
    CHECK (weight_kg IS NULL OR (weight_kg > 0 AND weight_kg <= 500)),
  CONSTRAINT body_assessments_height_range
    CHECK (height_cm IS NULL OR (height_cm > 0 AND height_cm <= 300)),
  CONSTRAINT body_assessments_body_fat_range
    CHECK (body_fat_pct IS NULL OR (body_fat_pct >= 0 AND body_fat_pct <= 100))
);

-- Listing assessments for one student in chronological order is the hottest
-- query (history list, comparison view). Composite index covers it.
CREATE INDEX IF NOT EXISTS idx_body_assessments_student_date
  ON body_assessments (student_id, performed_on DESC);

CREATE INDEX IF NOT EXISTS idx_body_assessments_trainer_date
  ON body_assessments (trainer_id, performed_on DESC);

CREATE TRIGGER trg_body_assessments_updated_at
  BEFORE UPDATE ON body_assessments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- 3. body_assessment_photos — at most one photo per (assessment, position)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS body_assessment_photos (
  id              UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id   UUID                        NOT NULL REFERENCES body_assessments(id) ON DELETE CASCADE,
  position        assessment_photo_position   NOT NULL,
  storage_path    TEXT                        NOT NULL,
  mime_type       TEXT,
  file_size_bytes INTEGER,
  created_at      TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
  CONSTRAINT uniq_photo_per_position UNIQUE (assessment_id, position)
);

CREATE INDEX IF NOT EXISTS idx_assessment_photos_assessment
  ON body_assessment_photos (assessment_id);


-- -----------------------------------------------------------------------------
-- 4. RLS — body_assessments
-- -----------------------------------------------------------------------------

ALTER TABLE body_assessments ENABLE ROW LEVEL SECURITY;

-- The student of the assessment can read it; the authoring trainer can read,
-- create, update and delete it; admins see everything.
CREATE POLICY "body_assessments: read"
  ON body_assessments FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR trainer_id = auth.uid()
    OR is_admin()
  );

-- Only the trainer of the student may write, and only when the student is
-- still coached by them at write time (prevents cross-coach tampering).
CREATE POLICY "body_assessments: trainer writes own students"
  ON body_assessments FOR INSERT TO authenticated
  WITH CHECK (
    trainer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = body_assessments.student_id
        AND p.coach_id = auth.uid()
    )
  );

CREATE POLICY "body_assessments: trainer updates own"
  ON body_assessments FOR UPDATE TO authenticated
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "body_assessments: trainer deletes own"
  ON body_assessments FOR DELETE TO authenticated
  USING (trainer_id = auth.uid());


-- -----------------------------------------------------------------------------
-- 5. RLS — body_assessment_photos
-- -----------------------------------------------------------------------------

ALTER TABLE body_assessment_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessment_photos: read"
  ON body_assessment_photos FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM body_assessments ba
      WHERE ba.id = body_assessment_photos.assessment_id
        AND (ba.student_id = auth.uid() OR ba.trainer_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "assessment_photos: trainer writes"
  ON body_assessment_photos FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM body_assessments ba
      WHERE ba.id = body_assessment_photos.assessment_id
        AND ba.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM body_assessments ba
      WHERE ba.id = body_assessment_photos.assessment_id
        AND ba.trainer_id = auth.uid()
    )
  );


-- -----------------------------------------------------------------------------
-- 6. Storage bucket — body-assessments (private)
-- -----------------------------------------------------------------------------
-- Path convention: {trainer_id}/{student_id}/{assessment_id}/{position}.{ext}
-- The first folder of every object is the trainer id; second is the student
-- id; third is the assessment id. Authorization rules below derive identity
-- from the path so we don't need additional metadata.

INSERT INTO storage.buckets (id, name, public)
VALUES ('body-assessments', 'body-assessments', FALSE)
ON CONFLICT (id) DO NOTHING;

-- The trainer (path's first folder) owns the object: full CRUD.
DROP POLICY IF EXISTS "body-assessments: trainer manages own folder" ON storage.objects;
CREATE POLICY "body-assessments: trainer manages own folder"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'body-assessments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'body-assessments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- The student (path's second folder) can read their own photos.
DROP POLICY IF EXISTS "body-assessments: student reads own photos" ON storage.objects;
CREATE POLICY "body-assessments: student reads own photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'body-assessments'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Admins read everything in this bucket.
DROP POLICY IF EXISTS "body-assessments: admin reads all" ON storage.objects;
CREATE POLICY "body-assessments: admin reads all"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'body-assessments'
    AND is_admin()
  );


-- -----------------------------------------------------------------------------
-- 7. Comments
-- -----------------------------------------------------------------------------

COMMENT ON TABLE body_assessments IS
  'Anthropometric assessment authored by a trainer. Supports bioimpedance and skinfold-based body fat protocols.';
COMMENT ON COLUMN body_assessments.protocol IS
  'Skinfold protocol used to compute body fat. NULL for bioimpedance entries.';
COMMENT ON COLUMN body_assessments.body_density IS
  'Body density derived from the chosen protocol. Audit value; body_fat_pct is the figure shown to the user.';
COMMENT ON TABLE body_assessment_photos IS
  'One photo per anatomical position (front/back/left/right) for a body assessment. Files live in the body-assessments storage bucket.';
