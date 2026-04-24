'use client';

import Link from 'next/link';
import { formatDateRange, formatSchedule } from './helpers';
import { CalendarIcon, DumbbellIcon, RepeatIcon, UserIcon } from './icons';
import { PlanCardRow } from './PlanCardRow';
import type { PlanCardProps } from './PlanCard.types';

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-background p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Active badge */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground leading-snug">
          {plan.name}
        </h3>
        <span
          className={[
            'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
            plan.is_active
              ? 'bg-success/15 text-success'
              : 'bg-muted text-muted-foreground',
          ].join(' ')}
        >
          {plan.is_active ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Meta info */}
      <div className="flex-1 space-y-2">
        <PlanCardRow
          icon={<UserIcon />}
          text={
            plan.assignment_count === 0
              ? 'Sem alunos atribuídos'
              : `${plan.assignment_count} ${
                  plan.assignment_count === 1
                    ? 'aluno atribuído'
                    : 'alunos atribuídos'
                }`
          }
        />
        <PlanCardRow
          icon={<CalendarIcon />}
          text={formatDateRange(plan.start_date, plan.end_date)}
        />
        <PlanCardRow
          icon={<RepeatIcon />}
          text={formatSchedule(plan.schedule_config)}
        />
        <PlanCardRow
          icon={<DumbbellIcon />}
          text={`${plan.day_count} ${plan.day_count === 1 ? 'dia de treino' : 'dias de treino'}`}
        />
      </div>

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-border">
        <Link
          href={`/plano-de-treino/${plan.id}`}
          className="text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Ver plano →
        </Link>
      </div>
    </div>
  );
}
