import type { BodyAssessmentFull, BodyAssessmentPhoto } from '@/core/domain';
import { PROTOCOLS, SKINFOLD_SITE_LABELS, type SkinfoldSite } from './protocols';

type AssessmentPhotoWithUrl = BodyAssessmentPhoto & { signed_url: string | null };

const SKINFOLD_FIELD: Record<SkinfoldSite, keyof BodyAssessmentFull> = {
  chest: 'skf_chest_mm',
  abdomen: 'skf_abdomen_mm',
  thigh: 'skf_thigh_mm',
  triceps: 'skf_triceps_mm',
  subscapular: 'skf_subscapular_mm',
  suprailiac: 'skf_suprailiac_mm',
  axillary: 'skf_axillary_mm',
  calf: 'skf_calf_mm',
};

const PERIMETERS: { label: string; key: keyof BodyAssessmentFull }[] = [
  { label: 'Pescoço', key: 'perim_neck_cm' },
  { label: 'Ombros', key: 'perim_shoulders_cm' },
  { label: 'Tórax', key: 'perim_chest_cm' },
  { label: 'Braço esquerdo', key: 'perim_arm_left_cm' },
  { label: 'Braço direito', key: 'perim_arm_right_cm' },
  { label: 'Cintura', key: 'perim_waist_cm' },
  { label: 'Abdominal', key: 'perim_abdomen_cm' },
  { label: 'Quadril', key: 'perim_hip_cm' },
  { label: 'Coxa esquerda', key: 'perim_thigh_left_cm' },
  { label: 'Coxa direita', key: 'perim_thigh_right_cm' },
  { label: 'Panturrilha esq.', key: 'perim_calf_left_cm' },
  { label: 'Panturrilha dir.', key: 'perim_calf_right_cm' },
];

const PHOTO_LABELS: Record<'front' | 'back' | 'left' | 'right', string> = {
  front: 'Frente',
  back: 'Costas',
  left: 'Perfil esquerdo',
  right: 'Perfil direito',
};

export interface AssessmentPrintViewProps {
  assessment: BodyAssessmentFull;
  studentName: string | null;
  trainerName?: string | null;
}

/**
 * Print-optimized view of a single body assessment. Uses Tailwind `print:`
 * variants to lock the layout to a clean A4 page when the user picks
 * "Save as PDF" from the browser print dialog.
 */
export function AssessmentPrintView({
  assessment,
  studentName,
  trainerName,
}: AssessmentPrintViewProps) {
  const protocolLabel = assessment.protocol
    ? PROTOCOLS[assessment.protocol].label
    : null;

  const skinfoldSites: SkinfoldSite[] =
    assessment.protocol && assessment.sex
      ? PROTOCOLS[assessment.protocol].sites[assessment.sex]
      : [];

  const photos = (assessment.photos as AssessmentPhotoWithUrl[]).reduce(
    (acc, p) => {
      acc[p.position] = p;
      return acc;
    },
    {} as Record<string, AssessmentPhotoWithUrl | undefined>
  );

  return (
    <article className="mx-auto w-full max-w-[820px] space-y-6 bg-white p-6 text-foreground print:p-0 print:text-black">
      <header className="border-b border-border pb-4 print:border-black">
        <p className="text-xs uppercase tracking-wide text-muted-foreground print:text-black">
          Avaliação física
        </p>
        <h1 className="mt-1 text-2xl font-bold">
          {studentName ?? 'Aluno sem nome'}
        </h1>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
          <KV label="Data" value={formatDate(assessment.performed_on)} />
          <KV
            label="Tipo"
            value={
              assessment.assessment_type === 'bioimpedance'
                ? 'Bioimpedância'
                : 'Dobras cutâneas'
            }
          />
          {protocolLabel && <KV label="Protocolo" value={protocolLabel} />}
          {assessment.sex && (
            <KV label="Sexo" value={assessment.sex === 'male' ? 'Masculino' : 'Feminino'} />
          )}
          {trainerName && <KV label="Avaliador" value={trainerName} />}
        </div>
      </header>

      <section>
        <SectionTitle>Resultados</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="IMC" value={assessment.bmi} unit="kg/m²" />
          <Metric label="% Gordura" value={assessment.body_fat_pct} unit="%" />
          <Metric label="Massa magra" value={assessment.lean_mass_kg} unit="kg" />
          <Metric label="Massa gorda" value={assessment.fat_mass_kg} unit="kg" />
        </div>
      </section>

      <section>
        <SectionTitle>Composição</SectionTitle>
        <DataGrid
          items={[
            { label: 'Peso', value: assessment.weight_kg, unit: 'kg' },
            { label: 'Altura', value: assessment.height_cm, unit: 'cm' },
          ]}
        />

        {assessment.assessment_type === 'skinfold' && skinfoldSites.length > 0 && (
          <div className="mt-3">
            <SubTitle>Dobras cutâneas (mm)</SubTitle>
            <DataGrid
              items={skinfoldSites.map((site) => ({
                label: SKINFOLD_SITE_LABELS[site],
                value: assessment[SKINFOLD_FIELD[site]] as number | null,
                unit: 'mm',
              }))}
            />
          </div>
        )}

        {assessment.assessment_type === 'bioimpedance' && (
          <div className="mt-3">
            <SubTitle>Leituras da bioimpedância</SubTitle>
            <DataGrid
              items={[
                { label: '% Gordura', value: assessment.bia_body_fat_pct, unit: '%' },
                { label: 'Massa magra', value: assessment.bia_lean_mass_kg, unit: 'kg' },
                { label: 'Massa gorda', value: assessment.bia_fat_mass_kg, unit: 'kg' },
              ]}
            />
          </div>
        )}
      </section>

      <section>
        <SectionTitle>Perímetros (cm)</SectionTitle>
        <DataGrid
          items={PERIMETERS.map((p) => ({
            label: p.label,
            value: assessment[p.key] as number | null,
            unit: 'cm',
          }))}
        />
      </section>

      {(['front', 'back', 'left', 'right'] as const).some((p) => photos[p]) && (
        <section className="break-inside-avoid">
          <SectionTitle>Fotos</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(['front', 'back', 'left', 'right'] as const).map((pos) => {
              const photo = photos[pos];
              return (
                <figure key={pos} className="space-y-1">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-border bg-muted/30 print:border-black">
                    {photo?.signed_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.signed_url}
                        alt={PHOTO_LABELS[pos]}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground print:text-black">
                        sem foto
                      </div>
                    )}
                  </div>
                  <figcaption className="text-center text-[11px] text-muted-foreground print:text-black">
                    {PHOTO_LABELS[pos]}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {assessment.notes && (
        <section className="break-inside-avoid">
          <SectionTitle>Observações</SectionTitle>
          <p className="whitespace-pre-wrap rounded-md border border-border bg-muted/20 p-3 text-sm leading-relaxed print:border-black print:bg-transparent">
            {assessment.notes}
          </p>
        </section>
      )}

      <footer className="border-t border-border pt-3 text-[11px] text-muted-foreground print:border-black print:text-black">
        Gerado em {new Date().toLocaleString('pt-BR')} • ID {assessment.id}
      </footer>
    </article>
  );
}

// ─── Sub-blocks ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground print:text-black">
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground print:text-black">
      {children}
    </h3>
  );
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/10 p-3 print:border-black print:bg-transparent">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground print:text-black">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums">
        {formatNumber(value, 1)}{' '}
        <span className="text-xs font-normal text-muted-foreground print:text-black">
          {unit}
        </span>
      </p>
    </div>
  );
}

function DataGrid({
  items,
}: {
  items: { label: string; value: number | null; unit: string }[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline justify-between gap-2">
          <dt className="text-muted-foreground print:text-black">{it.label}</dt>
          <dd className="font-medium tabular-nums">
            {formatNumber(it.value, 1)} {it.unit}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground print:text-black">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function formatNumber(value: number | null, digits: number): string {
  if (value === null || Number.isNaN(value)) return '—';
  return value.toFixed(digits).replace('.', ',');
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
