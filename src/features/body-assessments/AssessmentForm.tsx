'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Field,
  Input,
  Select,
  Stack,
  Tabs,
  Textarea,
} from '@/design-system';
import type {
  AssessmentSex,
  AssessmentType,
  BodyAssessment,
  SkinfoldProtocol,
} from '@/core/domain';
import { MetricNumberField } from './MetricNumberField';
import { PhotoDropzone } from './PhotoDropzone';
import { ResultsSidebar } from './ResultsSidebar';
import {
  PROTOCOL_OPTIONS,
  PROTOCOLS,
  SKINFOLD_SITE_LABELS,
  type SkinfoldSite,
  calcAgeYears,
  computeMetrics,
} from './protocols';
import {
  EMPTY_PHOTO_SLOT,
  createEmptyFormState,
  formStateFromRow,
  prefillFromPrevious,
  type AssessmentFormState,
  type PhotoSlots,
} from './types';
import {
  createAssessment,
  syncPhotoSlots,
  updateAssessment,
} from './actions';

export interface AssessmentFormProps {
  trainerId: string;
  studentId: string;
  studentName: string | null;
  /** Existing assessment for edit mode. Omit for "Nova avaliação". */
  initial?: BodyAssessment;
  /** Latest historical row, used to prefill stable fields on a new assessment. */
  previous?: BodyAssessment | null;
  /** Pre-built photo slots (e.g. resolved with signed URLs server-side). */
  initialPhotoSlots?: PhotoSlots;
  /** ISO date used as default `performed_on` for new entries. */
  todayIso: string;
}

const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  skinfold: 'Dobras Cutâneas',
  bioimpedance: 'Bioimpedância',
};

const SEX_OPTIONS: { value: AssessmentSex; label: string }[] = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
];

const SITE_TO_FIELD: Record<SkinfoldSite, keyof AssessmentFormState> = {
  chest: 'skf_chest_mm',
  abdomen: 'skf_abdomen_mm',
  thigh: 'skf_thigh_mm',
  triceps: 'skf_triceps_mm',
  subscapular: 'skf_subscapular_mm',
  suprailiac: 'skf_suprailiac_mm',
  axillary: 'skf_axillary_mm',
  calf: 'skf_calf_mm',
};

export function AssessmentForm({
  trainerId,
  studentId,
  studentName,
  initial,
  previous,
  initialPhotoSlots,
  todayIso,
}: AssessmentFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [form, setForm] = useState<AssessmentFormState>(() => {
    if (initial) return formStateFromRow(initial, todayIso);
    return prefillFromPrevious(createEmptyFormState(todayIso), previous ?? null);
  });

  const [photoSlots, setPhotoSlots] = useState<PhotoSlots>(
    initialPhotoSlots ?? buildEmptySlots()
  );

  const [activeTab, setActiveTab] = useState<'composition' | 'perimeters' | 'photos'>(
    'composition'
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Revoke any locally-created object URLs on unmount to avoid leaks.
  useEffect(() => {
    return () => {
      Object.values(photoSlots).forEach((slot) => {
        if (slot.pending_file && slot.preview_url) {
          URL.revokeObjectURL(slot.preview_url);
        }
      });
    };
    // intentional: capture latest slots only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Derived data ──────────────────────────────────────────────────────

  const ageYears = useMemo(() => {
    if (!form.birth_date) return null;
    const age = calcAgeYears(form.birth_date);
    return Number.isFinite(age) ? age : null;
  }, [form.birth_date]);

  const metrics = useMemo(
    () =>
      computeMetrics({
        assessmentType: form.assessment_type,
        protocol: form.protocol,
        sex: form.sex,
        ageYears,
        weightKg: form.weight_kg,
        heightCm: form.height_cm,
        skinfolds: {
          chest: form.skf_chest_mm,
          abdomen: form.skf_abdomen_mm,
          thigh: form.skf_thigh_mm,
          triceps: form.skf_triceps_mm,
          subscapular: form.skf_subscapular_mm,
          suprailiac: form.skf_suprailiac_mm,
          axillary: form.skf_axillary_mm,
          calf: form.skf_calf_mm,
        },
        biaBodyFatPct: form.bia_body_fat_pct,
        biaLeanMassKg: form.bia_lean_mass_kg,
        biaFatMassKg: form.bia_fat_mass_kg,
      }),
    [form, ageYears]
  );

  const protocolDef =
    form.assessment_type === 'skinfold' && form.protocol
      ? PROTOCOLS[form.protocol]
      : null;

  const requiredSites: SkinfoldSite[] =
    protocolDef && form.sex ? protocolDef.sites[form.sex] : [];

  // ─── Patch helpers ─────────────────────────────────────────────────────

  const setField = <K extends keyof AssessmentFormState>(
    key: K,
    value: AssessmentFormState[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const setNumberField = (key: keyof AssessmentFormState) =>
    (value: number | null) => setForm((prev) => ({ ...prev, [key]: value }));

  // ─── Save ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateForm(form);
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    try {
      const row = isEdit
        ? await updateAssessment({
            id: initial!.id,
            form,
            studentId,
            trainerId,
          })
        : await createAssessment({ form, studentId, trainerId });

      await syncPhotoSlots({
        trainerId,
        studentId,
        assessmentId: row.id,
        slots: photoSlots,
      });

      router.push(`/alunos/${studentId}/avaliacoes/${row.id}`);
      router.refresh();
    } catch (err) {
      console.error('[AssessmentForm] save', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar a avaliação.'
      );
      setSaving(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────

  const protocolLabel = protocolDef ? protocolDef.label : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="space-y-6">
        {/* ── Identification ────────────────────────────────────────────── */}
        <Card>
          <Card.Header>Identificação</Card.Header>
          <Card.Content>
            <Stack gap="md">
              <Field label="Aluno" htmlFor="student-name">
                <Input
                  id="student-name"
                  value={studentName ?? ''}
                  disabled
                  readOnly
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Data da avaliação" htmlFor="performed-on" required>
                  <Input
                    id="performed-on"
                    type="date"
                    value={form.performed_on}
                    onChange={(e) => setField('performed_on', e.target.value)}
                  />
                </Field>
                <Field label="Sexo" htmlFor="sex" required>
                  <Select
                    id="sex"
                    value={form.sex ?? ''}
                    onChange={(e) =>
                      setField('sex', (e.target.value || null) as AssessmentSex | null)
                    }
                  >
                    <option value="">Selecione…</option>
                    {SEX_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Data de nascimento"
                  hint={
                    ageYears != null
                      ? `Idade: ${ageYears} anos`
                      : 'Necessário para protocolos Pollock'
                  }
                  htmlFor="birth-date"
                >
                  <Input
                    id="birth-date"
                    type="date"
                    value={form.birth_date ?? ''}
                    onChange={(e) =>
                      setField('birth_date', e.target.value || null)
                    }
                  />
                </Field>
                <Field label="Tipo de avaliação" htmlFor="assessment-type" required>
                  <Select
                    id="assessment-type"
                    value={form.assessment_type}
                    onChange={(e) => {
                      const value = e.target.value as AssessmentType;
                      setForm((prev) => ({
                        ...prev,
                        assessment_type: value,
                        protocol:
                          value === 'skinfold'
                            ? prev.protocol ?? 'pollock_3'
                            : null,
                      }));
                    }}
                  >
                    {(Object.keys(ASSESSMENT_TYPE_LABELS) as AssessmentType[]).map(
                      (key) => (
                        <option key={key} value={key}>
                          {ASSESSMENT_TYPE_LABELS[key]}
                        </option>
                      )
                    )}
                  </Select>
                </Field>
              </div>

              {form.assessment_type === 'skinfold' && (
                <Field label="Protocolo" htmlFor="protocol" required>
                  <Select
                    id="protocol"
                    value={form.protocol ?? ''}
                    onChange={(e) =>
                      setField('protocol', e.target.value as SkinfoldProtocol)
                    }
                  >
                    {PROTOCOL_OPTIONS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
            </Stack>
          </Card.Content>
        </Card>

        {/* ── Tabs: composition / perimeters / photos ─────────────────── */}
        <Tabs value={activeTab} onChange={(v) => setActiveTab(v as typeof activeTab)}>
          <div className="overflow-x-auto">
            <Tabs.List className="w-full">
              <Tabs.Trigger value="composition">Composição</Tabs.Trigger>
              <Tabs.Trigger value="perimeters">Perímetros</Tabs.Trigger>
              <Tabs.Trigger value="photos">Fotos</Tabs.Trigger>
            </Tabs.List>
          </div>

          <Tabs.Panel value="composition" className="mt-4">
            <Card>
              <Card.Header>
                {form.assessment_type === 'skinfold'
                  ? 'Peso, altura e dobras cutâneas'
                  : 'Peso, altura e bioimpedância'}
              </Card.Header>
              <Card.Content>
                <Stack gap="md">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricNumberField
                      label="Peso"
                      unit="kg"
                      value={form.weight_kg}
                      onChange={setNumberField('weight_kg')}
                      precision={1}
                      min={0}
                      max={500}
                      required
                    />
                    <MetricNumberField
                      label="Altura"
                      unit="cm"
                      value={form.height_cm}
                      onChange={setNumberField('height_cm')}
                      precision={1}
                      min={0}
                      max={300}
                      required
                    />
                  </div>

                  {form.assessment_type === 'skinfold' ? (
                    <SkinfoldsBlock
                      sex={form.sex}
                      requiredSites={requiredSites}
                      values={form}
                      onChange={setNumberField}
                    />
                  ) : (
                    <BioimpedanceBlock
                      values={form}
                      onChange={setNumberField}
                    />
                  )}
                </Stack>
              </Card.Content>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="perimeters" className="mt-4">
            <Card>
              <Card.Header>Perímetros</Card.Header>
              <Card.Content>
                <PerimetersBlock values={form} onChange={setNumberField} />
              </Card.Content>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="photos" className="mt-4">
            <Card>
              <Card.Header>Fotos da avaliação</Card.Header>
              <Card.Content>
                <p className="mb-3 text-xs text-muted-foreground">
                  Frente, costas e perfis. JPG, PNG ou WebP — até 10 MB cada.
                </p>
                <PhotoDropzone
                  slots={photoSlots}
                  onChange={setPhotoSlots}
                  disabled={saving}
                />
              </Card.Content>
            </Card>
          </Tabs.Panel>
        </Tabs>

        {/* ── Notes ───────────────────────────────────────────────────── */}
        <Card>
          <Card.Header>Observações</Card.Header>
          <Card.Content>
            <Field htmlFor="notes" hint="Use para registrar contexto da avaliação (jejum, hidratação, etc.).">
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                rows={3}
                placeholder="Ex.: Aluno após 12h de jejum, hidratação adequada."
              />
            </Field>
          </Card.Content>
        </Card>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/alunos/${studentId}/avaliacoes`)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={saving}>
            {isEdit ? 'Salvar alterações' : 'Salvar avaliação'}
          </Button>
        </div>
      </div>

      <ResultsSidebar
        metrics={metrics}
        studentName={studentName}
        performedOn={form.performed_on}
        protocolLabel={protocolLabel}
      />
    </form>
  );
}

// ─── Sub-blocks ────────────────────────────────────────────────────────────

function SkinfoldsBlock({
  sex,
  requiredSites,
  values,
  onChange,
}: {
  sex: AssessmentSex | null;
  requiredSites: SkinfoldSite[];
  values: AssessmentFormState;
  onChange: (key: keyof AssessmentFormState) => (v: number | null) => void;
}) {
  if (!sex) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        Selecione o sexo do aluno para exibir as dobras do protocolo escolhido.
      </p>
    );
  }
  if (requiredSites.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        Selecione um protocolo para liberar os campos de dobras.
      </p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {requiredSites.map((site) => {
        const field = SITE_TO_FIELD[site];
        return (
          <MetricNumberField
            key={site}
            label={SKINFOLD_SITE_LABELS[site]}
            unit="mm"
            value={values[field] as number | null}
            onChange={onChange(field)}
            precision={1}
            min={0}
            max={100}
            required
          />
        );
      })}
    </div>
  );
}

function BioimpedanceBlock({
  values,
  onChange,
}: {
  values: AssessmentFormState;
  onChange: (key: keyof AssessmentFormState) => (v: number | null) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <MetricNumberField
        label="% Gordura (BIA)"
        unit="%"
        value={values.bia_body_fat_pct}
        onChange={onChange('bia_body_fat_pct')}
        precision={1}
        min={0}
        max={100}
      />
      <MetricNumberField
        label="Massa magra"
        unit="kg"
        value={values.bia_lean_mass_kg}
        onChange={onChange('bia_lean_mass_kg')}
        precision={1}
        min={0}
        max={300}
      />
      <MetricNumberField
        label="Massa gorda"
        unit="kg"
        value={values.bia_fat_mass_kg}
        onChange={onChange('bia_fat_mass_kg')}
        precision={1}
        min={0}
        max={300}
      />
    </div>
  );
}

function PerimetersBlock({
  values,
  onChange,
}: {
  values: AssessmentFormState;
  onChange: (key: keyof AssessmentFormState) => (v: number | null) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <MetricNumberField
        label="Pescoço"
        unit="cm"
        value={values.perim_neck_cm}
        onChange={onChange('perim_neck_cm')}
        precision={1}
      />
      <MetricNumberField
        label="Ombros"
        unit="cm"
        value={values.perim_shoulders_cm}
        onChange={onChange('perim_shoulders_cm')}
        precision={1}
      />
      <MetricNumberField
        label="Tórax"
        unit="cm"
        value={values.perim_chest_cm}
        onChange={onChange('perim_chest_cm')}
        precision={1}
      />
      <MetricNumberField
        label="Braço esquerdo"
        unit="cm"
        value={values.perim_arm_left_cm}
        onChange={onChange('perim_arm_left_cm')}
        precision={1}
      />
      <MetricNumberField
        label="Braço direito"
        unit="cm"
        value={values.perim_arm_right_cm}
        onChange={onChange('perim_arm_right_cm')}
        precision={1}
      />
      <MetricNumberField
        label="Cintura"
        unit="cm"
        value={values.perim_waist_cm}
        onChange={onChange('perim_waist_cm')}
        precision={1}
      />
      <MetricNumberField
        label="Abdominal"
        unit="cm"
        value={values.perim_abdomen_cm}
        onChange={onChange('perim_abdomen_cm')}
        precision={1}
      />
      <MetricNumberField
        label="Quadril"
        unit="cm"
        value={values.perim_hip_cm}
        onChange={onChange('perim_hip_cm')}
        precision={1}
      />
      <MetricNumberField
        label="Coxa esquerda"
        unit="cm"
        value={values.perim_thigh_left_cm}
        onChange={onChange('perim_thigh_left_cm')}
        precision={1}
      />
      <MetricNumberField
        label="Coxa direita"
        unit="cm"
        value={values.perim_thigh_right_cm}
        onChange={onChange('perim_thigh_right_cm')}
        precision={1}
      />
      <MetricNumberField
        label="Panturrilha esq."
        unit="cm"
        value={values.perim_calf_left_cm}
        onChange={onChange('perim_calf_left_cm')}
        precision={1}
      />
      <MetricNumberField
        label="Panturrilha dir."
        unit="cm"
        value={values.perim_calf_right_cm}
        onChange={onChange('perim_calf_right_cm')}
        precision={1}
      />
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildEmptySlots(): PhotoSlots {
  return {
    front: { ...EMPTY_PHOTO_SLOT },
    back: { ...EMPTY_PHOTO_SLOT },
    left: { ...EMPTY_PHOTO_SLOT },
    right: { ...EMPTY_PHOTO_SLOT },
  };
}

function validateForm(form: AssessmentFormState): string | null {
  if (!form.performed_on) return 'Informe a data da avaliação.';
  if (!form.weight_kg || form.weight_kg <= 0)
    return 'Informe um peso válido.';
  if (!form.height_cm || form.height_cm <= 0)
    return 'Informe uma altura válida.';
  if (!form.sex) return 'Selecione o sexo do aluno.';

  if (form.assessment_type === 'skinfold') {
    if (!form.protocol) return 'Selecione um protocolo de dobras.';
    const protocol = PROTOCOLS[form.protocol];
    if (protocol.requiresAge && !form.birth_date) {
      return 'Os protocolos Pollock exigem a data de nascimento.';
    }
    const sites = protocol.sites[form.sex];
    for (const site of sites) {
      const field = SITE_TO_FIELD[site];
      const value = form[field] as number | null;
      if (value == null || value <= 0) {
        return `Informe a dobra ${SKINFOLD_SITE_LABELS[site].toLowerCase()}.`;
      }
    }
  } else if (form.bia_body_fat_pct == null) {
    return 'Informe o percentual de gordura medido pela bioimpedância.';
  }

  return null;
}

// Re-exported so /avaliacoes/[id]/page.tsx can build slots from saved photos.
export { buildEmptySlots };
