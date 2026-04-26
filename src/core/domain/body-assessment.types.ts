// =============================================================================
// Body Assessment domain types — mirror the Supabase schema 1:1.
// =============================================================================

export type AssessmentType = 'bioimpedance' | 'skinfold';

export type SkinfoldProtocol =
  | 'pollock_3'
  | 'pollock_7'
  | 'guedes'
  | 'faulkner';

export type AssessmentSex = 'male' | 'female';

export type AssessmentPhotoPosition = 'front' | 'back' | 'left' | 'right';

/**
 * Single anthropometric assessment row. Numeric fields are stored as
 * NUMERIC in Postgres but PostgREST returns them as `number` (or null).
 */
export interface BodyAssessment {
  id: string;
  student_id: string;
  trainer_id: string;
  performed_on: string; // YYYY-MM-DD
  assessment_type: AssessmentType;
  protocol: SkinfoldProtocol | null;

  sex: AssessmentSex | null;
  birth_date: string | null;

  weight_kg: number | null;
  height_cm: number | null;

  // Skinfolds (mm)
  skf_chest_mm: number | null;
  skf_abdomen_mm: number | null;
  skf_thigh_mm: number | null;
  skf_triceps_mm: number | null;
  skf_subscapular_mm: number | null;
  skf_suprailiac_mm: number | null;
  skf_axillary_mm: number | null;
  skf_calf_mm: number | null;

  // Bioimpedance direct readings
  bia_body_fat_pct: number | null;
  bia_lean_mass_kg: number | null;
  bia_fat_mass_kg: number | null;

  // Perimeters (cm)
  perim_neck_cm: number | null;
  perim_shoulders_cm: number | null;
  perim_chest_cm: number | null;
  perim_arm_left_cm: number | null;
  perim_arm_right_cm: number | null;
  perim_waist_cm: number | null;
  perim_abdomen_cm: number | null;
  perim_hip_cm: number | null;
  perim_thigh_left_cm: number | null;
  perim_thigh_right_cm: number | null;
  perim_calf_left_cm: number | null;
  perim_calf_right_cm: number | null;

  // Persisted derived metrics
  bmi: number | null;
  body_density: number | null;
  body_fat_pct: number | null;
  lean_mass_kg: number | null;
  fat_mass_kg: number | null;

  notes: string | null;

  created_at: string;
  updated_at: string;
}

export interface BodyAssessmentPhoto {
  id: string;
  assessment_id: string;
  position: AssessmentPhotoPosition;
  storage_path: string;
  mime_type: string | null;
  file_size_bytes: number | null;
  created_at: string;
}

/** Assessment with its photos resolved (used in detail / edit views). */
export interface BodyAssessmentFull extends BodyAssessment {
  photos: BodyAssessmentPhoto[];
}

/** Lightweight row used in history lists (only the metrics shown). */
export interface BodyAssessmentSummary {
  id: string;
  performed_on: string;
  assessment_type: AssessmentType;
  protocol: SkinfoldProtocol | null;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  body_fat_pct: number | null;
  lean_mass_kg: number | null;
  fat_mass_kg: number | null;
}
