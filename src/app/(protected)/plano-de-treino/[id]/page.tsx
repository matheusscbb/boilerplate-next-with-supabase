import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/infra/supabase/server';
import {
  ApplyPlanToSelf,
  PlanForm,
  PlanStudentsManager,
  trainingPlanRowToFormState,
  type TrainingPlanDetailRow,
} from '@/features/training-plans';
import type { PlanStudentRow } from '@/features/training-plans';

interface PlanoDetalhePageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanoDetalhePage({ params }: PlanoDetalhePageProps) {
  const { id: rawId } = await params;
  const id = rawId?.trim();
  if (!id) notFound();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: row, error } = await supabase
    .from('training_plans')
    .select(
      `
      id,
      trainer_id,
      name,
      start_date,
      end_date,
      is_active,
      schedule_type,
      schedule_config,
      days:training_days(
        id,
        name,
        order_index,
        exercises(*)
      )
    `
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !row || row.trainer_id !== user?.id || !user?.id) {
    notFound();
  }

  const { data: selfActiveAssignment } = await supabase
    .from('plan_assignments')
    .select('id')
    .eq('plan_id', id)
    .eq('student_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  // Students currently assigned to this plan
  const { data: planAssignments } = await supabase
    .from('plan_assignments')
    .select('id, student_id, is_active, student:profiles!student_id(id, full_name)')
    .eq('plan_id', id);

  const assignedStudents: PlanStudentRow[] = (planAssignments ?? []).map((a) => {
    const student = Array.isArray(a.student) ? a.student[0] : a.student;
    return {
      assignmentId: a.id,
      studentId: a.student_id,
      studentName: student?.full_name ?? null,
      isActive: a.is_active,
    };
  });

  // All students coached by this trainer (to populate the assign dialog)
  const { data: trainerStudents } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('coach_id', user.id)
    .order('full_name', { ascending: true });

  const availableStudents = (trainerStudents ?? []).map((s) => ({
    id: s.id,
    full_name: s.full_name,
  }));

  const initialState = trainingPlanRowToFormState(row as TrainingPlanDetailRow);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href="/plano-de-treino"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Planos de Treino
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          {row.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visualize e edite a programação, os dias e os exercícios do plano.
        </p>
      </div>

      <ApplyPlanToSelf planId={row.id} isActiveForMe={!!selfActiveAssignment} />

      <PlanStudentsManager
        planId={row.id}
        assignedStudents={assignedStudents}
        availableStudents={availableStudents}
      />

      <PlanForm planId={row.id} initialState={initialState} />
    </div>
  );
}
