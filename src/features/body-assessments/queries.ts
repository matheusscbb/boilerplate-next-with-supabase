import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  BodyAssessment,
  BodyAssessmentFull,
  BodyAssessmentPhoto,
  BodyAssessmentSummary,
} from '@/core/domain';
import { BODY_ASSESSMENTS_BUCKET, SIGNED_URL_TTL_SECONDS } from './constants';

type AnySupabase = SupabaseClient;

const ASSESSMENT_COLUMNS = `
  id,
  student_id,
  trainer_id,
  performed_on,
  assessment_type,
  protocol,
  sex,
  birth_date,
  weight_kg,
  height_cm,
  skf_chest_mm,
  skf_abdomen_mm,
  skf_thigh_mm,
  skf_triceps_mm,
  skf_subscapular_mm,
  skf_suprailiac_mm,
  skf_axillary_mm,
  skf_calf_mm,
  bia_body_fat_pct,
  bia_lean_mass_kg,
  bia_fat_mass_kg,
  perim_neck_cm,
  perim_shoulders_cm,
  perim_chest_cm,
  perim_arm_left_cm,
  perim_arm_right_cm,
  perim_waist_cm,
  perim_abdomen_cm,
  perim_hip_cm,
  perim_thigh_left_cm,
  perim_thigh_right_cm,
  perim_calf_left_cm,
  perim_calf_right_cm,
  bmi,
  body_density,
  body_fat_pct,
  lean_mass_kg,
  fat_mass_kg,
  notes,
  created_at,
  updated_at
`;

const SUMMARY_COLUMNS = `
  id,
  performed_on,
  assessment_type,
  protocol,
  weight_kg,
  height_cm,
  bmi,
  body_fat_pct,
  lean_mass_kg,
  fat_mass_kg
`;

/**
 * Returns assessment summaries for a student, newest first. The composite
 * index (student_id, performed_on DESC) backs this lookup so it stays cheap
 * even with hundreds of historical rows.
 */
export async function listAssessmentsByStudent(
  supabase: AnySupabase,
  studentId: string
): Promise<BodyAssessmentSummary[]> {
  const { data, error } = await supabase
    .from('body_assessments')
    .select(SUMMARY_COLUMNS)
    .eq('student_id', studentId)
    .order('performed_on', { ascending: false });

  if (error || !data) return [];
  return data as unknown as BodyAssessmentSummary[];
}

/** Most recent assessment for a student — used to prefill stable fields. */
export async function getStudentLatestAssessment(
  supabase: AnySupabase,
  studentId: string
): Promise<BodyAssessment | null> {
  const { data, error } = await supabase
    .from('body_assessments')
    .select(ASSESSMENT_COLUMNS)
    .eq('student_id', studentId)
    .order('performed_on', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as BodyAssessment;
}

/**
 * Fetch a full assessment with its photos resolved to short-lived signed
 * URLs so they can be rendered without exposing the bucket publicly.
 */
export async function getAssessmentById(
  supabase: AnySupabase,
  id: string
): Promise<BodyAssessmentFull | null> {
  const { data, error } = await supabase
    .from('body_assessments')
    .select(`${ASSESSMENT_COLUMNS}, photos:body_assessment_photos(*)`)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  const photos = (data.photos ?? []) as BodyAssessmentPhoto[];

  // Generate signed URLs in batch; fall back to empty when storage is offline.
  const photoPaths = photos.map((p) => p.storage_path);
  const signed: Record<string, string> = {};
  if (photoPaths.length > 0) {
    const { data: urls } = await supabase.storage
      .from(BODY_ASSESSMENTS_BUCKET)
      .createSignedUrls(photoPaths, SIGNED_URL_TTL_SECONDS);
    for (const entry of urls ?? []) {
      if (entry.path && entry.signedUrl) {
        signed[entry.path] = entry.signedUrl;
      }
    }
  }

  const photosWithUrl = photos.map((p) => ({
    ...p,
    // attach signed url as a sibling field; UI consumes it directly
    signed_url: signed[p.storage_path] ?? null,
  })) as Array<BodyAssessmentPhoto & { signed_url: string | null }>;

  return {
    ...(data as unknown as BodyAssessment),
    photos: photosWithUrl,
  };
}

/**
 * Fetch the lightweight student profile for the trainer-facing form header.
 * Verifies the caller is the assigned coach; returns null otherwise so route
 * handlers can 404 cleanly.
 */
export async function getStudentForCoach(
  supabase: AnySupabase,
  studentId: string,
  coachId: string
): Promise<{ id: string; full_name: string | null } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', studentId)
    .eq('coach_id', coachId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
