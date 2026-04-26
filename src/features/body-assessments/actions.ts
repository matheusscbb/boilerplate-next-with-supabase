'use client';

import { createClient } from '@/infra/supabase/client';
import type {
  AssessmentPhotoPosition,
  BodyAssessment,
} from '@/core/domain';
import { BODY_ASSESSMENTS_BUCKET } from './constants';
import type { AssessmentFormState, PhotoSlots } from './types';
import { calcAgeYears, computeMetrics } from './protocols';

// ─── Persistence payload ───────────────────────────────────────────────────

/**
 * Shape we send to the database. Computed metrics are baked in here so the
 * persisted row matches what the trainer saw on screen at save time.
 */
function buildAssessmentPayload(
  form: AssessmentFormState,
  studentId: string,
  trainerId: string
) {
  const ageYears =
    form.birth_date && form.birth_date.length >= 10
      ? calcAgeYears(form.birth_date)
      : null;

  const metrics = computeMetrics({
    assessmentType: form.assessment_type,
    protocol: form.protocol,
    sex: form.sex,
    ageYears,
    weightKg: form.weight_kg,
    heightCm: form.height_cm,
    skinfolds: {
      chest: form.skf_chest_mm,
      abdomen: form.skf_abdomen_mm,
      thigh: form.skf_thigh_mm,
      triceps: form.skf_triceps_mm,
      subscapular: form.skf_subscapular_mm,
      suprailiac: form.skf_suprailiac_mm,
      axillary: form.skf_axillary_mm,
      calf: form.skf_calf_mm,
    },
    biaBodyFatPct: form.bia_body_fat_pct,
    biaLeanMassKg: form.bia_lean_mass_kg,
    biaFatMassKg: form.bia_fat_mass_kg,
  });

  return {
    student_id: studentId,
    trainer_id: trainerId,
    performed_on: form.performed_on,
    assessment_type: form.assessment_type,
    protocol: form.assessment_type === 'skinfold' ? form.protocol : null,
    sex: form.sex,
    birth_date: form.birth_date,
    weight_kg: form.weight_kg,
    height_cm: form.height_cm,
    skf_chest_mm: form.skf_chest_mm,
    skf_abdomen_mm: form.skf_abdomen_mm,
    skf_thigh_mm: form.skf_thigh_mm,
    skf_triceps_mm: form.skf_triceps_mm,
    skf_subscapular_mm: form.skf_subscapular_mm,
    skf_suprailiac_mm: form.skf_suprailiac_mm,
    skf_axillary_mm: form.skf_axillary_mm,
    skf_calf_mm: form.skf_calf_mm,
    bia_body_fat_pct: form.bia_body_fat_pct,
    bia_lean_mass_kg: form.bia_lean_mass_kg,
    bia_fat_mass_kg: form.bia_fat_mass_kg,
    perim_neck_cm: form.perim_neck_cm,
    perim_shoulders_cm: form.perim_shoulders_cm,
    perim_chest_cm: form.perim_chest_cm,
    perim_arm_left_cm: form.perim_arm_left_cm,
    perim_arm_right_cm: form.perim_arm_right_cm,
    perim_waist_cm: form.perim_waist_cm,
    perim_abdomen_cm: form.perim_abdomen_cm,
    perim_hip_cm: form.perim_hip_cm,
    perim_thigh_left_cm: form.perim_thigh_left_cm,
    perim_thigh_right_cm: form.perim_thigh_right_cm,
    perim_calf_left_cm: form.perim_calf_left_cm,
    perim_calf_right_cm: form.perim_calf_right_cm,
    notes: form.notes.trim() ? form.notes.trim() : null,
    bmi: metrics.bmi,
    body_density: metrics.bodyDensity,
    body_fat_pct: metrics.bodyFatPct,
    lean_mass_kg: metrics.leanMassKg,
    fat_mass_kg: metrics.fatMassKg,
  };
}

// ─── CRUD ──────────────────────────────────────────────────────────────────

export async function createAssessment(input: {
  form: AssessmentFormState;
  studentId: string;
  trainerId: string;
}): Promise<BodyAssessment> {
  const supabase = createClient();
  const payload = buildAssessmentPayload(
    input.form,
    input.studentId,
    input.trainerId
  );
  const { data, error } = await supabase
    .from('body_assessments')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as BodyAssessment;
}

export async function updateAssessment(input: {
  id: string;
  form: AssessmentFormState;
  studentId: string;
  trainerId: string;
}): Promise<BodyAssessment> {
  const supabase = createClient();
  const payload = buildAssessmentPayload(
    input.form,
    input.studentId,
    input.trainerId
  );
  const { data, error } = await supabase
    .from('body_assessments')
    .update(payload)
    .eq('id', input.id)
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as BodyAssessment;
}

export async function deleteAssessment(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('body_assessments')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── Photos ────────────────────────────────────────────────────────────────

function extensionFromMime(mime: string): string {
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/heic') return 'heic';
  if (mime === 'image/heif') return 'heif';
  return 'bin';
}

function photoStoragePath(args: {
  trainerId: string;
  studentId: string;
  assessmentId: string;
  position: AssessmentPhotoPosition;
  ext: string;
}): string {
  return `${args.trainerId}/${args.studentId}/${args.assessmentId}/${args.position}.${args.ext}`;
}

/**
 * Upload (or replace) a single photo. Storage is content-addressed by path,
 * so re-uploading on the same position transparently overwrites the file.
 */
export async function uploadAssessmentPhoto(input: {
  trainerId: string;
  studentId: string;
  assessmentId: string;
  position: AssessmentPhotoPosition;
  file: File;
}): Promise<void> {
  const supabase = createClient();
  const ext = extensionFromMime(input.file.type) || 'bin';
  const path = photoStoragePath({
    trainerId: input.trainerId,
    studentId: input.studentId,
    assessmentId: input.assessmentId,
    position: input.position,
    ext,
  });

  const upload = await supabase.storage
    .from(BODY_ASSESSMENTS_BUCKET)
    .upload(path, input.file, {
      upsert: true,
      contentType: input.file.type || 'application/octet-stream',
    });
  if (upload.error) throw upload.error;

  // Upsert by composite (assessment_id, position) so a replacement keeps the
  // same logical row instead of creating a duplicate.
  const upsert = await supabase.from('body_assessment_photos').upsert(
    {
      assessment_id: input.assessmentId,
      position: input.position,
      storage_path: path,
      mime_type: input.file.type || null,
      file_size_bytes: input.file.size,
    },
    { onConflict: 'assessment_id,position' }
  );
  if (upsert.error) throw upsert.error;
}

export async function removeAssessmentPhoto(input: {
  photoId: string;
  storagePath: string;
}): Promise<void> {
  const supabase = createClient();
  // Order matters: clear the DB row first so RLS on storage stays consistent.
  const del = await supabase
    .from('body_assessment_photos')
    .delete()
    .eq('id', input.photoId);
  if (del.error) throw del.error;

  const remove = await supabase.storage
    .from(BODY_ASSESSMENTS_BUCKET)
    .remove([input.storagePath]);
  if (remove.error) {
    // Storage error after DB delete is non-fatal: the row is gone, the file
    // becomes orphaned. Surface it so the trainer can re-try if needed.
    console.warn('[body-assessments] orphaned storage object', remove.error);
  }
}

/**
 * Persist all pending photo changes attached to an assessment in parallel.
 * Used by the form save handler.
 */
export async function syncPhotoSlots(input: {
  trainerId: string;
  studentId: string;
  assessmentId: string;
  slots: PhotoSlots;
}): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  for (const [position, slot] of Object.entries(input.slots) as Array<
    [AssessmentPhotoPosition, PhotoSlots[AssessmentPhotoPosition]]
  >) {
    if (slot.marked_for_deletion && slot.id && slot.storage_path) {
      tasks.push(
        removeAssessmentPhoto({
          photoId: slot.id,
          storagePath: slot.storage_path,
        })
      );
      continue;
    }
    if (slot.pending_file) {
      tasks.push(
        uploadAssessmentPhoto({
          trainerId: input.trainerId,
          studentId: input.studentId,
          assessmentId: input.assessmentId,
          position,
          file: slot.pending_file,
        })
      );
    }
  }

  if (tasks.length === 0) return;
  await Promise.all(tasks);
}
