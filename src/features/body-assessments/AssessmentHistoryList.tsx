import Link from 'next/link';
import { Badge } from '@/design-system';
import type { BodyAssessmentSummary } from '@/core/domain';
import { PROTOCOLS } from './protocols';

export interface AssessmentHistoryListProps {
  studentId: string;
  rows: BodyAssessmentSummary[];
}

/**
 * Read-only timeline of past assessments. Each row links to the detail/edit
 * page so the trainer can compare numbers without leaving the list.
 *
 * Row order matches the persistence query (`performed_on DESC`) so the most
 * recent assessment lands at the top — which is what trainers expect when
 * comparing with the previous one.
 */
export function AssessmentHistoryList({ studentId, rows }: AssessmentHistoryListProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <p className="text-sm font-medium text-foreground">
          Nenhuma avaliação registrada.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Comece criando a primeira avaliação física deste aluno.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((row, index) => {
        const previous = rows[index + 1] ?? null;
        const protocolLabel = row.protocol ? PROTOCOLS[row.protocol].label : null;
        return (
          <li key={row.id}>
            <Link
              href={`/alunos/${studentId}/avaliacoes/${row.id}`}
              className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-6"
            >
              <div className="min-w-[120px]">
                <p className="text-sm font-semibold text-foreground">
                  {formatPerformedOn(row.performed_on)}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant={row.assessment_type === 'bioimpedance' ? 'info' : 'primary'}
                    size="sm"
                  >
                    {row.assessment_type === 'bioimpedance'
                      ? 'Bioimpedância'
                      : 'Dobras'}
                  </Badge>
                  {protocolLabel && (
                    <Badge variant="default" size="sm">
                      {protocolLabel}
                    </Badge>
                  )}
                </div>
              </div>

              <dl className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                <Cell
                  label="Peso"
                  value={formatNumber(row.weight_kg, 1)}
                  unit="kg"
                  delta={delta(row.weight_kg, previous?.weight_kg)}
                />
                <Cell
                  label="IMC"
                  value={formatNumber(row.bmi, 1)}
                  unit="kg/m²"
                  delta={delta(row.bmi, previous?.bmi)}
                />
                <Cell
                  label="% Gordura"
                  value={formatNumber(row.body_fat_pct, 1)}
                  unit="%"
                  delta={delta(row.body_fat_pct, previous?.body_fat_pct)}
                  invertColors
                />
                <Cell
                  label="Massa Magra"
                  value={formatNumber(row.lean_mass_kg, 1)}
                  unit="kg"
                  delta={delta(row.lean_mass_kg, previous?.lean_mass_kg)}
                />
              </dl>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Cell({
  label,
  value,
  unit,
  delta,
  invertColors,
}: {
  label: string;
  value: string;
  unit: string;
  delta: number | null;
  /** When true, downward delta is positive (e.g. body fat going down is good). */
  invertColors?: boolean;
}) {
  const showDelta = delta !== null && Math.abs(delta) >= 0.05;
  const positive = invertColors ? (delta ?? 0) < 0 : (delta ?? 0) > 0;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 flex items-baseline gap-1.5">
        <span className="text-lg font-semibold tabular-nums text-foreground">
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{unit}</span>
        {showDelta && (
          <span
            className={[
              'ml-auto text-xs font-medium tabular-nums',
              positive ? 'text-green-600 dark:text-green-400' : 'text-destructive',
            ].join(' ')}
          >
            {(delta as number) > 0 ? '+' : ''}
            {(delta as number).toFixed(1)}
          </span>
        )}
      </dd>
    </div>
  );
}

function delta(current: number | null, previous: number | null | undefined): number | null {
  if (current == null || previous == null) return null;
  return current - previous;
}

function formatNumber(value: number | null, digits: number): string {
  if (value === null || Number.isNaN(value)) return '—';
  return value.toFixed(digits).replace('.', ',');
}

function formatPerformedOn(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
