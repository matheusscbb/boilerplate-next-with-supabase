import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/infra/supabase/server';
import {
  AssessmentForm,
  getStudentForCoach,
  getStudentLatestAssessment,
} from '@/features/body-assessments';

export const dynamic = 'force-dynamic';

export default async function NewAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const student = await getStudentForCoach(supabase, studentId, user.id);
  if (!student) notFound();

  // Last historical row prefills sex / birth_date / height — values that
  // rarely change between assessments. Saves the trainer a few seconds.
  const previous = await getStudentLatestAssessment(supabase, studentId);

  const today = new Date().toISOString().slice(0, 10);

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

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Nova avaliação</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhamento de{' '}
          <span className="font-medium text-foreground">
            {student.full_name ?? 'Aluno sem nome'}
          </span>
          . Os resultados são calculados em tempo real.
        </p>
      </div>

      <AssessmentForm
        trainerId={user.id}
        studentId={studentId}
        studentName={student.full_name}
        previous={previous}
        todayIso={today}
      />
    </div>
  );
}
