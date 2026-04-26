import type { BodyAssessmentSummary } from '@/core/domain';
import { EvolutionChart, type EvolutionPoint } from './EvolutionChart';

export interface EvolutionPanelProps {
  /** Summary rows. Order doesn't matter — the panel sorts ascending by date. */
  rows: BodyAssessmentSummary[];
}

interface MetricSpec {
  title: string;
  unit: string;
  key: keyof BodyAssessmentSummary;
  color: string;
  invertColors?: boolean;
  precision?: number;
}

const METRICS: MetricSpec[] = [
  { title: 'Peso', unit: 'kg', key: 'weight_kg', color: 'var(--color-primary)' },
  { title: 'IMC', unit: 'kg/m²', key: 'bmi', color: '#0ea5e9' },
  {
    title: '% Gordura',
    unit: '%',
    key: 'body_fat_pct',
    color: '#f59e0b',
    invertColors: true,
  },
  { title: 'Massa magra', unit: 'kg', key: 'lean_mass_kg', color: '#10b981' },
];

/**
 * Quick visual summary of the student's evolution across the most recent
 * assessments. Renders one mini line chart per key metric so trainers can
 * skim the trend without opening every assessment in detail.
 */
export function EvolutionPanel({ rows }: EvolutionPanelProps) {
  if (rows.length < 2) return null;

  // Sort ascending so the chart reads left-to-right (oldest → newest).
  const sorted = [...rows].sort((a, b) =>
    a.performed_on.localeCompare(b.performed_on)
  );

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {METRICS.map((metric) => {
        const points: EvolutionPoint[] = sorted.map((row) => ({
          date: row.performed_on,
          value: (row[metric.key] as number | null) ?? null,
        }));
        const hasAnyValue = points.some((p) => p.value != null);
        if (!hasAnyValue) return null;
        return (
          <EvolutionChart
            key={metric.key as string}
            title={metric.title}
            unit={metric.unit}
            color={metric.color}
            invertColors={metric.invertColors}
            precision={metric.precision ?? 1}
            points={points}
            subtitle={`${points.length} avaliações`}
          />
        );
      })}
    </section>
  );
}
