import { notFound } from 'next/navigation';
import { createClient } from '@/infra/supabase/server';
import {
  AssessmentPrintView,
  PrintActions,
  PrintTrigger,
  getAssessmentById,
  getStudentForCoach,
} from '@/features/body-assessments';

export const dynamic = 'force-dynamic';

export default async function PrintAssessmentPage({
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

  // Best-effort trainer name lookup; print stays valid even if it fails.
  const { data: trainerProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', assessment.trainer_id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-muted/10 px-4 py-6 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto mb-4 flex w-full max-w-[820px] items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-muted-foreground">
          Use o botão ao lado para imprimir ou salvar como PDF.
        </p>
        <PrintActions />
      </div>

      <AssessmentPrintView
        assessment={assessment}
        studentName={student.full_name}
        trainerName={trainerProfile?.full_name ?? null}
      />

      <PrintTrigger />
    </div>
  );
}
