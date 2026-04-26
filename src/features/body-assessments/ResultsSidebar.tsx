'use client';

import type { ComputedMetrics } from './protocols';

export interface ResultsSidebarProps {
  metrics: ComputedMetrics;
  studentName: string | null;
  performedOn: string;
  protocolLabel: string | null;
}

/**
 * Sticky live-results card. The form recomputes `metrics` on every keystroke
 * via the pure `computeMetrics` helper and passes the snapshot here. No state
 * inside, no Supabase: the sidebar is a presentational mirror.
 */
export function ResultsSidebar({
  metrics,
  studentName,
  performedOn,
  protocolLabel,
}: ResultsSidebarProps) {
  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Resultados em tempo real
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {studentName ?? 'Aluno'}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatPerformedOn(performedOn)}
          </p>
        </div>

        {protocolLabel && (
          <p className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {protocolLabel}
          </p>
        )}

        <dl className="grid grid-cols-2 gap-3">
          <MetricCell label="IMC" value={formatNumber(metrics.bmi, 1)} unit="kg/m²" />
          <MetricCell
            label="% Gordura"
            value={formatNumber(metrics.bodyFatPct, 1)}
            unit="%"
          />
          <MetricCell
            label="Massa Magra"
            value={formatNumber(metrics.leanMassKg, 1)}
            unit="kg"
          />
          <MetricCell
            label="Massa Gorda"
            value={formatNumber(metrics.fatMassKg, 1)}
            unit="kg"
          />
        </dl>

        {metrics.bmi != null && (
          <p className="mt-4 text-xs text-muted-foreground">
            Classificação IMC: {classifyBmi(metrics.bmi)}
          </p>
        )}
      </div>
    </aside>
  );
}

function MetricCell({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </dd>
    </div>
  );
}

function formatNumber(value: number | null, digits: number): string {
  if (value === null || Number.isNaN(value)) return '—';
  return value.toFixed(digits).replace('.', ',');
}

function formatPerformedOn(iso: string): string {
  if (!iso) return '';
  // YYYY-MM-DD -> DD/MM/YYYY without going through Date (avoids timezone drift).
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function classifyBmi(bmi: number): string {
  if (bmi < 18.5) return 'Abaixo do peso';
  if (bmi < 25) return 'Eutrófico';
  if (bmi < 30) return 'Sobrepeso';
  if (bmi < 35) return 'Obesidade grau I';
  if (bmi < 40) return 'Obesidade grau II';
  return 'Obesidade grau III';
}
