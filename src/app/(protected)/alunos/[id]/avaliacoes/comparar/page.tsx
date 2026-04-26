import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/infra/supabase/server';
import {
  AssessmentCompareView,
  getAssessmentById,
  getStudentForCoach,
  listAssessmentsByStudent,
} from '@/features/body-assessments';

export const dynamic = 'force-dynamic';

export default async function CompareAssessmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { id: studentId } = await params;
  const { from: fromParam, to: toParam } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const student = await getStudentForCoach(supabase, studentId, user.id);
  if (!student) notFound();

  const rows = await listAssessmentsByStudent(supabase, studentId);

  // Defaults: most recent on the right ("depois"), the previous one on the
  // left ("antes"). If only one row exists we still render the picker so the
  // trainer is told what to do.
  const defaultTo = rows[0]?.id ?? null;
  const defaultFrom = rows[1]?.id ?? null;

  const fromId = isKnownId(fromParam, rows) ? fromParam! : defaultFrom;
  const toId = isKnownId(toParam, rows) ? toParam! : defaultTo;

  // If the same id is on both sides, nudge the left one to a different row.
  let resolvedFromId: string | null = fromId;
  if (fromId && toId && fromId === toId) {
    resolvedFromId = rows.find((r) => r.id !== toId)?.id ?? null;
  }

  const [from, to] = await Promise.all([
    resolvedFromId ? getAssessmentById(supabase, resolvedFromId) : Promise.resolve(null),
    toId ? getAssessmentById(supabase, toId) : Promise.resolve(null),
  ]);

  // Defensive: if a request returns an assessment from another student, drop it.
  const sanitize = (a: typeof from) =>
    a && a.student_id === studentId ? a : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-2">
        <Link
          href={`/alunos/${studentId}/avaliacoes`}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          ← Voltar para o histórico
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Comparar avaliações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão lado a lado das medidas de{' '}
          <span className="font-medium text-foreground">
            {student.full_name ?? 'Aluno sem nome'}
          </span>
          .
        </p>
      </div>

      <AssessmentCompareView
        studentId={studentId}
        studentName={student.full_name}
        rows={rows}
        from={sanitize(from)}
        to={sanitize(to)}
      />
    </div>
  );
}

function isKnownId(
  candidate: string | undefined,
  rows: { id: string }[]
): boolean {
  return Boolean(candidate && rows.some((r) => r.id === candidate));
}
