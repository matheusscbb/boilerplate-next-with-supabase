import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/infra/supabase/server';
import {
  AssessmentForm,
  EMPTY_PHOTO_SLOT,
  getAssessmentById,
  getStudentForCoach,
  type PhotoSlots,
} from '@/features/body-assessments';
import type {
  AssessmentPhotoPosition,
  BodyAssessmentPhoto,
} from '@/core/domain';

export const dynamic = 'force-dynamic';

type AssessmentPhotoWithUrl = BodyAssessmentPhoto & { signed_url: string | null };

function buildPhotoSlots(
  photos: AssessmentPhotoWithUrl[]
): PhotoSlots {
  const base: PhotoSlots = {
    front: { ...EMPTY_PHOTO_SLOT },
    back: { ...EMPTY_PHOTO_SLOT },
    left: { ...EMPTY_PHOTO_SLOT },
    right: { ...EMPTY_PHOTO_SLOT },
  };

  for (const photo of photos) {
    const position = photo.position as AssessmentPhotoPosition;
    base[position] = {
      id: photo.id,
      storage_path: photo.storage_path,
      preview_url: photo.signed_url,
      pending_file: null,
      marked_for_deletion: false,
    };
  }
  return base;
}

export default async function EditAssessmentPage({
  params,
}: {
  params: Promise<{ id: string; assessmentId: string }>;
}) {
  const { id: studentId, assessmentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [student, assessment] = await Promise.all([
    getStudentForCoach(supabase, studentId, user.id),
    getAssessmentById(supabase, assessmentId),
  ]);

  if (!student || !assessment || assessment.student_id !== studentId) {
    notFound();
  }

  const today = new Date().toISOString().slice(0, 10);
  const slots = buildPhotoSlots(
    assessment.photos as AssessmentPhotoWithUrl[]
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-2">
        <Link
          href={`/alunos/${studentId}/avaliacoes`}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          ← Voltar para o histórico
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Avaliação de {formatDate(assessment.performed_on)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aluno:{' '}
            <span className="font-medium text-foreground">
              {student.full_name ?? 'Aluno sem nome'}
            </span>
            . Você pode atualizar os dados ou as fotos a qualquer momento.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={`/alunos/${studentId}/avaliacoes/${assessmentId}/pdf`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Baixar PDF
          </a>
          <Link
            href={`/alunos/${studentId}/avaliacoes/${assessmentId}/imprimir`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Visão de impressão
          </Link>
        </div>
      </div>

      <AssessmentForm
        trainerId={user.id}
        studentId={studentId}
        studentName={student.full_name}
        initial={assessment}
        initialPhotoSlots={slots}
        todayIso={today}
      />
    </div>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
