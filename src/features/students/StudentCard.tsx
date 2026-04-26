'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/design-system';
import { AssignPlanDialog } from './AssignPlanDialog';
import type {
  AssignablePlan,
  StudentLatestAssessment,
  StudentSummary,
} from './types';

export interface StudentCardProps {
  student: StudentSummary;
  plans: AssignablePlan[];
}

export function StudentCard({ student, plans }: StudentCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const displayName = student.full_name?.trim() || 'Aluno sem nome';
  const initials = buildInitials(displayName);
  const assessmentsHref = `/alunos/${student.id}/avaliacoes`;

  return (
    <>
      <article className="flex h-full flex-col rounded-xl border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
        {/* Selecting the student takes the trainer to the tracking screen
            (assessment history); secondary actions live in the footer. */}
        <Link
          href={assessmentsHref}
          className="-m-2 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {student.active_plan_name
                ? `Plano ativo: ${student.active_plan_name}`
                : 'Sem plano ativo'}
            </p>
          </div>
        </Link>

        <LatestAssessmentBlock latest={student.latest_assessment} />

        <footer className="mt-4 grid grid-cols-2 gap-2">
          <Link href={assessmentsHref}>
            <Button type="button" size="sm" fullWidth>
              Acompanhamento
            </Button>
          </Link>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => setDialogOpen(true)}
          >
            Atribuir plano
          </Button>
        </footer>
      </article>

      <AssignPlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={student}
        plans={plans}
      />
    </>
  );
}

function LatestAssessmentBlock({
  latest,
}: {
  latest: StudentLatestAssessment | null;
}) {
  if (!latest) {
    return (
      <p className="mt-3 rounded-md bg-muted/40 px-2.5 py-2 text-[11px] text-muted-foreground">
        Nenhuma avaliação registrada ainda.
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-md bg-muted/40 px-2.5 py-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Última avaliação
        </span>
        <time className="text-[10px] tabular-nums text-muted-foreground">
          {formatShortDate(latest.performed_on)}
        </time>
      </div>
      <dl className="grid grid-cols-3 gap-1.5">
        <KpiCell label="Peso" value={formatNumber(latest.weight_kg, 1)} unit="kg" />
        <KpiCell
          label="% Gordura"
          value={formatNumber(latest.body_fat_pct, 1)}
          unit="%"
        />
        <KpiCell label="IMC" value={formatNumber(latest.bmi, 1)} unit="" />
      </dl>
    </div>
  );
}

function KpiCell({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div>
      <dt className="text-[10px] text-muted-foreground">{label}</dt>
      <dd className="text-xs font-semibold tabular-nums text-foreground">
        {value}
        {value !== '—' && unit ? (
          <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

function formatNumber(value: number | null, precision: number): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toFixed(precision).replace('.', ',');
}

function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y.slice(2)}`;
}

function buildInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
