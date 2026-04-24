-- =============================================================================
-- Trainer License Expiry
-- =============================================================================
-- Adds an optional license_expires_at column to profiles.
-- When set and in the past, trainers are blocked from accessing the app.
-- NULL means the license never expires.
-- =============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS license_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.license_expires_at IS
  'Optional expiry timestamp for trainer licenses. NULL = never expires. '
  'When set and in the past, the trainer is blocked by the middleware.';
