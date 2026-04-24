import Link from 'next/link';
import { createClient } from '@/infra/supabase/server';
import { Button } from '@/design-system';
import { PlanCard } from '@/features/training-plans';
import type { PlanCardData } from '@/features/training-plans';
import type { ScheduleConfig } from '@/core/domain';

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7 text-muted-foreground"
          aria-hidden="true"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
          <path d="M12 14h.01M12 18h.01" />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-foreground">
        Nenhum plano cadastrado
      </h3>
      <p className="mb-6 max-w-xs text-sm text-muted-foreground">
        Crie o primeiro plano de treino para começar a gerenciar seus alunos.
      </p>
      <Link href="/plano-de-treino/novo">
        <Button>Criar primeiro plano</Button>
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PlanosPage() {
  const supabase = await createClient();

  // Trainer-owned plans only. Assignments are loaded as an aggregate so we can
  // show "N alunos atribuídos" on the card.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const trainerId = user?.id;

  const query = supabase
    .from('training_plans')
    .select(
      `
      id,
      name,
      is_active,
      start_date,
      end_date,
      schedule_type,
      schedule_config,
      days:training_days(id),
      assignments:plan_assignments(id)
    `
    )
    .order('created_at', { ascending: false });

  const { data: rows, error } = trainerId
    ? await query.eq('trainer_id', trainerId)
    : await query;

  // If tables don't exist yet or there's a permission error, show empty state
  const plans: PlanCardData[] =
    !error && rows
      ? rows.map((r) => ({
          id: r.id,
          name: r.name,
          is_active: r.is_active,
          start_date: r.start_date,
          end_date: r.end_date,
          schedule_type: r.schedule_type,
          schedule_config: r.schedule_config as ScheduleConfig,
          day_count: Array.isArray(r.days) ? r.days.length : 0,
          assignment_count: Array.isArray(r.assignments)
            ? r.assignments.length
            : 0,
        }))
      : [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planos de Treino</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os planos atribuídos aos seus alunos.
          </p>
        </div>
        <Link href="/plano-de-treino/novo">
          <Button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Novo plano
          </Button>
        </Link>
      </div>

      {plans.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
