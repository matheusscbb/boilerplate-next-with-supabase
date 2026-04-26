// Single source of truth for storage-related constants. Keeps queries.ts and
// actions.ts in sync without circular imports.

export const BODY_ASSESSMENTS_BUCKET = 'body-assessments';

/** Lifetime of generated signed URLs, in seconds. */
export const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour
