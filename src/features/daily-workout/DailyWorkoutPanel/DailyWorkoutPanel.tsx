'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button } from '@/design-system';
import { DayObservationCard } from '../DayObservationCard';
import { ExerciseLogCard } from '../ExerciseLogCard';
import { WorkoutCalendar } from '../WorkoutCalendar';
import { classifyDate, resolveScheduledDay } from '../helpers';
import type {
  DailyWorkoutPanelProps,
} from '../types';

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(d);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function DailyWorkoutPanel({
  plan,
  selectedDate,
  today,
  monthISO,
  monthSessions,
  selectedSession,
  emptyPlanCoachHint = false,
}: DailyWorkoutPanelProps) {
  const router = useRouter();
  // Child components may create the session lazily on first edit; we keep a
  // local fallback until `router.refresh()` repopulates `selectedSession`.
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const sessionId = selectedSession?.id ?? pendingSessionId;

  const onSessionCreated = useCallback(
    (id: string) => {
      setPendingSessionId(id);
      router.refresh();
    },
    [router]
  );

  const dayMode = classifyDate(selectedDate, today);
  const readOnly = dayMode === 'future';

  const scheduled = useMemo(
    () => (plan ? resolveScheduledDay(plan, selectedDate) : null),
    [plan, selectedDate]
  );

  const logsByExerciseId = useMemo(() => {
    const out: Record<string, NonNullable<typeof selectedSession>['logs'][number]> = {};
    if (!selectedSession) return out;
    for (const l of selectedSession.logs) out[l.exercise_id] = l;
    return out;
  }, [selectedSession]);

  if (!plan) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          title="Sem plano ativo"
          description={
            emptyPlanCoachHint
              ? 'Abra um dos seus planos em Plano de Treino e use o botão "Usar este plano em mim" para ele aparecer aqui e você registrar os treinos como aluno do próprio plano.'
              : 'Você ainda não tem um plano de treino ativo. Peça ao seu trainer para ativar um plano para começar a registrar treinos.'
          }
          action={
            <Link href="/plano-de-treino">
              <Button>Ver planos</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[320px_1fr]">
      <aside className="mx-auto mb-6 w-full max-w-sm lg:mx-0 lg:mb-0 lg:max-w-none">
        <WorkoutCalendar
          plan={plan}
          selectedDate={selectedDate}
          monthISO={monthISO}
          monthSessions={monthSessions}
          today={today}
        />
      </aside>

      <section className="min-w-0">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">
                {capitalize(formatDate(selectedDate))}
              </h2>
              {dayMode === 'today' && <Badge variant="primary" size="sm">Hoje</Badge>}
              {dayMode === 'past' && <Badge variant="default" size="sm">Passado</Badge>}
              {dayMode === 'future' && (
                <Badge variant="info" size="sm">Futuro — somente leitura</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Plano ativo: <span className="font-medium text-foreground">{plan.name}</span>
              {scheduled && (
                <>
                  {' • '}
                  {scheduled.day.name}
                </>
              )}
            </p>
          </div>

          {selectedDate !== today && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.replace(`/treinos?date=${today}`, { scroll: false })}
            >
              Ir para hoje
            </Button>
          )}
        </header>

        {!scheduled ? (
          <EmptyState
            title="Descanso"
            description="Nenhum treino agendado para esta data de acordo com o plano ativo."
          />
        ) : scheduled.day.exercises.length === 0 ? (
          <EmptyState
            title="Dia sem exercícios"
            description="O trainer ainda não cadastrou exercícios para este dia do plano."
          />
        ) : (
          <div className="space-y-4">
            {scheduled.day.exercises
              .slice()
              .sort((a, b) => a.order_index - b.order_index)
              .map((ex) => (
                <ExerciseLogCard
                  key={ex.id}
                  exercise={ex}
                  initialLog={logsByExerciseId[ex.id] ?? null}
                  sessionId={sessionId}
                  planId={plan.id}
                  performedOn={selectedDate}
                  readOnly={readOnly}
                  onSessionCreated={onSessionCreated}
                />
              ))}

            <DayObservationCard
              sessionId={sessionId}
              planId={plan.id}
              performedOn={selectedDate}
              initialObservation={selectedSession?.day_observation ?? ''}
              readOnly={readOnly}
              onSessionCreated={onSessionCreated}
            />
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Internals ────────────────────────────────────────────────────────────────

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
      <h3 className="mb-1 text-base font-semibold text-foreground">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

