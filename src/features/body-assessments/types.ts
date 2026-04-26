import type {
  AssessmentPhotoPosition,
  AssessmentSex,
  AssessmentType,
  BodyAssessment,
  SkinfoldProtocol,
} from '@/core/domain';

/**
 * Form-side representation of an assessment. Numbers are kept as `number | null`
 * to play well with the design-system's NumberStepper. Snake_case mirrors the
 * persistence column names so we don't need a translator layer when saving.
 */
export interface AssessmentFormState {
  performed_on: string;
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

  // Bioimpedance direct values
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

  notes: string;
}

/** Bare-minimum data needed to render the trainer-side form header. */
export interface AssessmentStudentInfo {
  id: string;
  full_name: string | null;
}

/** Photo state inside the form: either a saved row or a pending upload. */
export interface PhotoSlotState {
  /** Existing photo row id (when already saved). */
  id: string | null;
  storage_path: string | null;
  /** Local preview URL (object URL for pending file or signed URL for saved). */
  preview_url: string | null;
  /** Pending file the user selected; uploaded on save. */
  pending_file: File | null;
  /** When user clicks remove on an already-saved photo. */
  marked_for_deletion: boolean;
}

export type PhotoSlots = Record<AssessmentPhotoPosition, PhotoSlotState>;

export const EMPTY_PHOTO_SLOT: PhotoSlotState = {
  id: null,
  storage_path: null,
  preview_url: null,
  pending_file: null,
  marked_for_deletion: false,
};

export const PHOTO_POSITIONS: { value: AssessmentPhotoPosition; label: string }[] = [
  { value: 'front', label: 'Frente' },
  { value: 'back', label: 'Costas' },
  { value: 'left', label: 'Perfil Esquerdo' },
  { value: 'right', label: 'Perfil Direito' },
];

/** Returns the empty form state used when starting a new assessment. */
export function createEmptyFormState(today: string): AssessmentFormState {
  return {
    performed_on: today,
    assessment_type: 'skinfold',
    protocol: 'pollock_3',
    sex: null,
    birth_date: null,

    weight_kg: null,
    height_cm: null,

    skf_chest_mm: null,
    skf_abdomen_mm: null,
    skf_thigh_mm: null,
    skf_triceps_mm: null,
    skf_subscapular_mm: null,
    skf_suprailiac_mm: null,
    skf_axillary_mm: null,
    skf_calf_mm: null,

    bia_body_fat_pct: null,
    bia_lean_mass_kg: null,
    bia_fat_mass_kg: null,

    perim_neck_cm: null,
    perim_shoulders_cm: null,
    perim_chest_cm: null,
    perim_arm_left_cm: null,
    perim_arm_right_cm: null,
    perim_waist_cm: null,
    perim_abdomen_cm: null,
    perim_hip_cm: null,
    perim_thigh_left_cm: null,
    perim_thigh_right_cm: null,
    perim_calf_left_cm: null,
    perim_calf_right_cm: null,

    notes: '',
  };
}

/** Hydrate the form from an existing row (edit mode / prefill from previous). */
export function formStateFromRow(
  row: BodyAssessment,
  today: string
): AssessmentFormState {
  return {
    performed_on: row.performed_on ?? today,
    assessment_type: row.assessment_type,
    protocol: row.protocol,
    sex: row.sex,
    birth_date: row.birth_date,
    weight_kg: row.weight_kg,
    height_cm: row.height_cm,
    skf_chest_mm: row.skf_chest_mm,
    skf_abdomen_mm: row.skf_abdomen_mm,
    skf_thigh_mm: row.skf_thigh_mm,
    skf_triceps_mm: row.skf_triceps_mm,
    skf_subscapular_mm: row.skf_subscapular_mm,
    skf_suprailiac_mm: row.skf_suprailiac_mm,
    skf_axillary_mm: row.skf_axillary_mm,
    skf_calf_mm: row.skf_calf_mm,
    bia_body_fat_pct: row.bia_body_fat_pct,
    bia_lean_mass_kg: row.bia_lean_mass_kg,
    bia_fat_mass_kg: row.bia_fat_mass_kg,
    perim_neck_cm: row.perim_neck_cm,
    perim_shoulders_cm: row.perim_shoulders_cm,
    perim_chest_cm: row.perim_chest_cm,
    perim_arm_left_cm: row.perim_arm_left_cm,
    perim_arm_right_cm: row.perim_arm_right_cm,
    perim_waist_cm: row.perim_waist_cm,
    perim_abdomen_cm: row.perim_abdomen_cm,
    perim_hip_cm: row.perim_hip_cm,
    perim_thigh_left_cm: row.perim_thigh_left_cm,
    perim_thigh_right_cm: row.perim_thigh_right_cm,
    perim_calf_left_cm: row.perim_calf_left_cm,
    perim_calf_right_cm: row.perim_calf_right_cm,
    notes: row.notes ?? '',
  };
}

/**
 * Carry over previous-assessment values that are stable over time so the
 * trainer doesn't retype them every session (sex, birth date, height).
 */
export function prefillFromPrevious(
  form: AssessmentFormState,
  previous: BodyAssessment | null
): AssessmentFormState {
  if (!previous) return form;
  return {
    ...form,
    sex: form.sex ?? previous.sex,
    birth_date: form.birth_date ?? previous.birth_date,
    height_cm: form.height_cm ?? previous.height_cm,
  };
}
