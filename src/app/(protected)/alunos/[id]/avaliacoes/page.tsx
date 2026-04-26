import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/infra/supabase/server';
import { Button } from '@/design-system';
import {
  AssessmentHistoryList,
  EvolutionPanel,
  getStudentForCoach,
  listAssessmentsByStudent,
} from '@/features/body-assessments';

export const dynamic = 'force-dynamic';

export default async function StudentAssessmentsPage({
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

  const assessments = await listAssessmentsByStudent(supabase, studentId);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-2">
        <Link
          href="/alunos"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          ← Voltar para Alunos
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Avaliações físicas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Histórico de avaliações de{' '}
            <span className="font-medium text-foreground">
              {student.full_name ?? 'Aluno sem nome'}
            </span>
            .
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {assessments.length >= 2 && (
            <Link href={`/alunos/${studentId}/avaliacoes/comparar`}>
              <Button variant="secondary" fullWidth>
                Comparar avaliações
              </Button>
            </Link>
          )}
          <Link href={`/alunos/${studentId}/avaliacoes/nova`}>
            <Button fullWidth>+ Nova avaliação</Button>
          </Link>
        </div>
      </div>

      {assessments.length >= 2 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Evolução
          </h2>
          <EvolutionPanel rows={assessments} />
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Histórico
      </h2>
      <AssessmentHistoryList studentId={studentId} rows={assessments} />
    </div>
  );
}
