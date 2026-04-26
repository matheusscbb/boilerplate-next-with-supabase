'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge, Card, Stack } from '@/design-system';
import type {
  BodyAssessment,
  BodyAssessmentFull,
  BodyAssessmentPhoto,
  BodyAssessmentSummary,
} from '@/core/domain';
import { PROTOCOLS, SKINFOLD_SITE_LABELS, type SkinfoldSite } from './protocols';
import { TimelineScrubber } from './TimelineScrubber';

type AssessmentPhotoWithUrl = BodyAssessmentPhoto & { signed_url: string | null };

export interface AssessmentCompareViewProps {
  studentId: string;
  studentName: string | null;
  rows: BodyAssessmentSummary[];
  /** Left side ("antes"). Older assessment by default. */
  from: BodyAssessmentFull | null;
  /** Right side ("depois"). Newer assessment by default. */
  to: BodyAssessmentFull | null;
}

interface MetricRowDef {
  label: string;
  key: keyof BodyAssessment;
  unit: string;
  precision: number;
  /** When true, a downward delta is good news (e.g. body fat). */
  invertColors?: boolean;
}

const COMPOSITION_ROWS: MetricRowDef[] = [
  { label: 'Peso', key: 'weight_kg', unit: 'kg', precision: 1 },
  { label: 'Altura', key: 'height_cm', unit: 'cm', precision: 1 },
  { label: 'IMC', key: 'bmi', unit: 'kg/m²', precision: 1 },
  { label: '% Gordura', key: 'body_fat_pct', unit: '%', precision: 1, invertColors: true },
  { label: 'Massa Magra', key: 'lean_mass_kg', unit: 'kg', precision: 1 },
  { label: 'Massa Gorda', key: 'fat_mass_kg', unit: 'kg', precision: 1, invertColors: true },
];

const PERIMETER_ROWS: MetricRowDef[] = [
  { label: 'Pescoço', key: 'perim_neck_cm', unit: 'cm', precision: 1 },
  { label: 'Ombros', key: 'perim_shoulders_cm', unit: 'cm', precision: 1 },
  { label: 'Tórax', key: 'perim_chest_cm', unit: 'cm', precision: 1 },
  { label: 'Braço esquerdo', key: 'perim_arm_left_cm', unit: 'cm', precision: 1 },
  { label: 'Braço direito', key: 'perim_arm_right_cm', unit: 'cm', precision: 1 },
  { label: 'Cintura', key: 'perim_waist_cm', unit: 'cm', precision: 1, invertColors: true },
  { label: 'Abdominal', key: 'perim_abdomen_cm', unit: 'cm', precision: 1, invertColors: true },
  { label: 'Quadril', key: 'perim_hip_cm', unit: 'cm', precision: 1 },
  { label: 'Coxa esquerda', key: 'perim_thigh_left_cm', unit: 'cm', precision: 1 },
  { label: 'Coxa direita', key: 'perim_thigh_right_cm', unit: 'cm', precision: 1 },
  { label: 'Panturrilha esq.', key: 'perim_calf_left_cm', unit: 'cm', precision: 1 },
  { label: 'Panturrilha dir.', key: 'perim_calf_right_cm', unit: 'cm', precision: 1 },
];

const SKINFOLD_FIELD_BY_SITE: Record<SkinfoldSite, keyof BodyAssessment> = {
  chest: 'skf_chest_mm',
  abdomen: 'skf_abdomen_mm',
  thigh: 'skf_thigh_mm',
  triceps: 'skf_triceps_mm',
  subscapular: 'skf_subscapular_mm',
  suprailiac: 'skf_suprailiac_mm',
  axillary: 'skf_axillary_mm',
  calf: 'skf_calf_mm',
};

const PHOTO_POSITIONS: { key: 'front' | 'back' | 'left' | 'right'; label: string }[] = [
  { key: 'front', label: 'Frente' },
  { key: 'back', label: 'Costas' },
  { key: 'left', label: 'Perfil esquerdo' },
  { key: 'right', label: 'Perfil direito' },
];

/**
 * Side-by-side comparison of two body assessments. Trainers can swap either
 * column independently via the dropdowns; selection lives in the URL so the
 * view is shareable and back-button friendly.
 */
export function AssessmentCompareView({
  studentId,
  studentName,
  rows,
  from,
  to,
}: AssessmentCompareViewProps) {
  const router = useRouter();
  const params = useSearchParams();

  const handleSelect = (slot: 'from' | 'to', value: string) => {
    const next = new URLSearchParams(params?.toString() ?? '');
    if (value) {
      next.set(slot, value);
    } else {
      next.delete(slot);
    }
    router.replace(`?${next.toString()}`, { scroll: false });
  };

  // Skinfold rows shown depend on the union of sites used in either side.
  const skinfoldRows = useMemo<MetricRowDef[]>(() => {
    const sites = new Set<SkinfoldSite>();
    for (const a of [from, to]) {
      if (a?.protocol && a.sex) {
        for (const site of PROTOCOLS[a.protocol].sites[a.sex]) sites.add(site);
      }
    }
    return Array.from(sites).map((site) => ({
      label: SKINFOLD_SITE_LABELS[site],
      key: SKINFOLD_FIELD_BY_SITE[site],
      unit: 'mm',
      precision: 1,
      invertColors: true,
    }));
  }, [from, to]);

  if (rows.length < 2) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <p className="text-sm font-medium text-foreground">
          São necessárias pelo menos duas avaliações para comparar.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre uma nova avaliação para começar a acompanhar a evolução de{' '}
          <span className="font-medium text-foreground">
            {studentName ?? 'seu aluno'}
          </span>
          .
        </p>
        <div className="mt-4">
          <Link
            href={`/alunos/${studentId}/avaliacoes/nova`}
            className="text-sm font-medium text-primary hover:underline"
          >
            + Nova avaliação
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <Card.Content>
          <TimelineScrubber
            rows={rows}
            fromId={from?.id ?? null}
            toId={to?.id ?? null}
            onSelect={handleSelect}
          />
        </Card.Content>
      </Card>

      {!from || !to ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          Selecione duas avaliações para visualizar a comparação.
        </div>
      ) : (
        <Stack gap="lg">
          <ComparisonHeader from={from} to={to} />
          <ComparisonSection title="Composição corporal" rows={COMPOSITION_ROWS} from={from} to={to} />
          {skinfoldRows.length > 0 && (
            <ComparisonSection title="Dobras cutâneas" rows={skinfoldRows} from={from} to={to} />
          )}
          <ComparisonSection title="Perímetros" rows={PERIMETER_ROWS} from={from} to={to} />
          <ComparisonPhotos from={from} to={to} />
        </Stack>
      )}
    </div>
  );
}

// ─── Sub-blocks ────────────────────────────────────────────────────────────

function ComparisonHeader({
  from,
  to,
}: {
  from: BodyAssessmentFull;
  to: BodyAssessmentFull;
}) {
  const days = daysBetween(from.performed_on, to.performed_on);
  return (
    <Card>
      <Card.Content>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <HeaderColumn label="Antes" assessment={from} />
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Intervalo
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
              {days != null ? `${Math.abs(days)} dias` : '—'}
            </p>
          </div>
          <HeaderColumn label="Depois" assessment={to} alignEnd />
        </div>
      </Card.Content>
    </Card>
  );
}

function HeaderColumn({
  label,
  assessment,
  alignEnd,
}: {
  label: string;
  assessment: BodyAssessmentFull;
  alignEnd?: boolean;
}) {
  const protocolLabel = assessment.protocol
    ? PROTOCOLS[assessment.protocol].label
    : null;
  return (
    <div className={alignEnd ? 'sm:text-right' : ''}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-foreground">
        {formatDate(assessment.performed_on)}
      </p>
      <div
        className={[
          'mt-1.5 flex flex-wrap items-center gap-1.5',
          alignEnd ? 'sm:justify-end' : '',
        ].join(' ')}
      >
        <Badge
          variant={
            assessment.assessment_type === 'bioimpedance' ? 'info' : 'primary'
          }
          size="sm"
        >
          {assessment.assessment_type === 'bioimpedance'
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
  );
}

function ComparisonSection({
  title,
  rows,
  from,
  to,
}: {
  title: string;
  rows: MetricRowDef[];
  from: BodyAssessmentFull;
  to: BodyAssessmentFull;
}) {
  const visible = rows.filter((row) => {
    const a = from[row.key] as number | null;
    const b = to[row.key] as number | null;
    return a != null || b != null;
  });

  if (visible.length === 0) return null;

  return (
    <Card>
      <Card.Header>{title}</Card.Header>
      <Card.Content>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Métrica</th>
                <th className="px-3 py-2 text-right font-medium">
                  {formatDate(from.performed_on)}
                </th>
                <th className="px-3 py-2 text-right font-medium">
                  {formatDate(to.performed_on)}
                </th>
                <th className="px-3 py-2 text-right font-medium">Δ</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const a = from[row.key] as number | null;
                const b = to[row.key] as number | null;
                const d = delta(b, a);
                return (
                  <tr
                    key={row.key as string}
                    className="border-t border-border/60"
                  >
                    <td className="px-3 py-2 text-foreground">{row.label}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-foreground">
                      {formatValue(a, row.precision, row.unit)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-foreground">
                      {formatValue(b, row.precision, row.unit)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <DeltaCell
                        value={d}
                        precision={row.precision}
                        invertColors={row.invertColors}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card.Content>
    </Card>
  );
}

function ComparisonPhotos({
  from,
  to,
}: {
  from: BodyAssessmentFull;
  to: BodyAssessmentFull;
}) {
  const fromPhotos = indexPhotos(from.photos as AssessmentPhotoWithUrl[]);
  const toPhotos = indexPhotos(to.photos as AssessmentPhotoWithUrl[]);

  const hasAny = PHOTO_POSITIONS.some(
    (p) => fromPhotos[p.key] || toPhotos[p.key]
  );
  if (!hasAny) return null;

  return (
    <Card>
      <Card.Header>Fotos</Card.Header>
      <Card.Content>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PHOTO_POSITIONS.map((p) => (
            <div key={p.key} className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {p.label}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <PhotoTile photo={fromPhotos[p.key]} caption={formatDate(from.performed_on)} />
                <PhotoTile photo={toPhotos[p.key]} caption={formatDate(to.performed_on)} />
              </div>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

function PhotoTile({
  photo,
  caption,
}: {
  photo: AssessmentPhotoWithUrl | undefined;
  caption: string;
}) {
  return (
    <div className="space-y-1">
      <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-border bg-muted/30">
        {photo?.signed_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.signed_url}
            alt={caption}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            sem foto
          </div>
        )}
      </div>
      <p className="text-center text-[11px] text-muted-foreground">{caption}</p>
    </div>
  );
}

function DeltaCell({
  value,
  precision,
  invertColors,
}: {
  value: number | null;
  precision: number;
  invertColors?: boolean;
}) {
  if (value === null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  if (Math.abs(value) < 10 ** -precision / 2) {
    return <span className="text-xs text-muted-foreground">0,0</span>;
  }
  const positive = invertColors ? value < 0 : value > 0;
  return (
    <span
      className={[
        'text-sm font-semibold tabular-nums',
        positive ? 'text-green-600 dark:text-green-400' : 'text-destructive',
      ].join(' ')}
    >
      {value > 0 ? '+' : ''}
      {value.toFixed(precision).replace('.', ',')}
    </span>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function indexPhotos(
  photos: AssessmentPhotoWithUrl[]
): Record<string, AssessmentPhotoWithUrl | undefined> {
  const map: Record<string, AssessmentPhotoWithUrl | undefined> = {};
  for (const p of photos) map[p.position] = p;
  return map;
}

function delta(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null) return null;
  return current - previous;
}

function formatValue(
  value: number | null,
  precision: number,
  unit: string
): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toFixed(precision).replace('.', ',')} ${unit}`;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function daysBetween(a: string, b: string): number | null {
  const [y1, m1, d1] = a.split('-').map((n) => Number.parseInt(n, 10));
  const [y2, m2, d2] = b.split('-').map((n) => Number.parseInt(n, 10));
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return null;
  const da = Date.UTC(y1, m1 - 1, d1);
  const db = Date.UTC(y2, m2 - 1, d2);
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}
