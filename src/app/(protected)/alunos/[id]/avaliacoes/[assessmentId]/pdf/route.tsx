import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

import { createClient } from '@/infra/supabase/server';
import {
  AssessmentPdfDocument,
  getAssessmentById,
  getStudentForCoach,
} from '@/features/body-assessments';

// react-pdf relies on Node-only APIs (streams, fs), so we must opt out of
// the Edge runtime and avoid static caching.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string; assessmentId: string }>;
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { id: studentId, assessmentId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const [student, assessment] = await Promise.all([
    getStudentForCoach(supabase, studentId, user.id),
    getAssessmentById(supabase, assessmentId),
  ]);

  if (!student || !assessment || assessment.student_id !== studentId) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Best-effort trainer name; we don't fail the export if the lookup misses.
  const { data: trainerProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', assessment.trainer_id)
    .maybeSingle();

  const pdfBuffer = await renderToBuffer(
    <AssessmentPdfDocument
      assessment={assessment}
      studentName={student.full_name}
      trainerName={trainerProfile?.full_name ?? null}
    />
  );

  // Build a friendly filename: avaliacao_<aluno>_<yyyy-mm-dd>.pdf
  const slug = (student.full_name ?? 'aluno')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const filename = `avaliacao_${slug || 'aluno'}_${assessment.performed_on}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
