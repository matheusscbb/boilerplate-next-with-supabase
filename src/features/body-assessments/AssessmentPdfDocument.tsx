import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import type {
  BodyAssessmentFull,
  BodyAssessmentPhoto,
} from '@/core/domain';

import { PROTOCOLS, SKINFOLD_SITE_LABELS, type SkinfoldSite } from './protocols';

/**
 * Server-rendered PDF document for a single body assessment.
 *
 * Uses @react-pdf/renderer's React-flavoured primitives (`<Document>`,
 * `<Page>`, `<View>`, `<Text>`, `<Image>`) — they are NOT DOM elements, so
 * this file must only ever be imported from server code (route handlers).
 *
 * Photos are referenced via signed URLs; @react-pdf/renderer fetches them
 * server-side when generating the document, so the bucket can stay private.
 */

type PhotoWithUrl = BodyAssessmentPhoto & { signed_url: string | null };

export interface AssessmentPdfDocumentProps {
  assessment: BodyAssessmentFull;
  studentName: string | null;
  trainerName?: string | null;
}

const COLORS = {
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  accent: '#2563eb',
  surface: '#f8fafc',
  good: '#16a34a',
  bad: '#dc2626',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 36,
    fontSize: 10,
    color: COLORS.text,
    fontFamily: 'Helvetica',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  headerSubtitle: { color: COLORS.muted, marginTop: 2 },
  headerRight: { textAlign: 'right' },
  headerLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerValue: { fontSize: 12, fontFamily: 'Helvetica-Bold' },

  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: COLORS.muted,
  },

  resultsRow: { flexDirection: 'row', gap: 8 },
  resultsCell: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultsLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultsValue: {
    marginTop: 4,
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
  resultsUnit: {
    fontSize: 9,
    color: COLORS.muted,
    fontFamily: 'Helvetica',
  },

  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableHeaderCell: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  tableLabel: { flex: 2 },
  tableValue: { flex: 1, textAlign: 'right' },

  photosGrid: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  photoTile: {
    width: '23.5%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  photoLabel: {
    fontSize: 8,
    textAlign: 'center',
    paddingVertical: 3,
    color: COLORS.muted,
    backgroundColor: COLORS.surface,
  },
  photo: { width: '100%', height: 130, objectFit: 'cover' },

  notesBox: {
    padding: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },

  footer: {
    position: 'absolute',
    bottom: 18,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: COLORS.muted,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
});

const PHOTO_LABELS: Record<'front' | 'back' | 'left' | 'right', string> = {
  front: 'Frente',
  back: 'Costas',
  left: 'Perfil esquerdo',
  right: 'Perfil direito',
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

export function AssessmentPdfDocument({
  assessment,
  studentName,
  trainerName,
}: AssessmentPdfDocumentProps) {
  const photos = (assessment.photos ?? []) as PhotoWithUrl[];
  const indexedPhotos: Record<string, PhotoWithUrl | undefined> = {};
  for (const p of photos) indexedPhotos[p.position] = p;
  const hasPhotos = photos.some((p) => p.signed_url);

  const protocolLabel = assessment.protocol
    ? PROTOCOLS[assessment.protocol].label
    : null;
  const sites: SkinfoldSite[] =
    assessment.protocol && assessment.sex
      ? PROTOCOLS[assessment.protocol].sites[assessment.sex]
      : [];

  return (
    <Document
      title={`Avaliação ${formatDate(assessment.performed_on)}`}
      author={trainerName ?? undefined}
      subject={studentName ?? undefined}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Avaliação Física</Text>
            <Text style={styles.headerSubtitle}>
              {studentName ?? 'Aluno sem nome'}
            </Text>
            {trainerName ? (
              <Text style={styles.headerSubtitle}>Treinador: {trainerName}</Text>
            ) : null}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Data</Text>
            <Text style={styles.headerValue}>
              {formatDate(assessment.performed_on)}
            </Text>
            <Text style={[styles.headerLabel, { marginTop: 4 }]}>Tipo</Text>
            <Text style={styles.headerValue}>
              {assessment.assessment_type === 'bioimpedance'
                ? 'Bioimpedância'
                : 'Dobras cutâneas'}
            </Text>
            {protocolLabel ? (
              <Text style={[styles.headerSubtitle, { marginTop: 2 }]}>
                Protocolo: {protocolLabel}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Results */}
        <Text style={styles.sectionTitle}>Resultados</Text>
        <View style={styles.resultsRow}>
          <ResultsCell label="IMC" value={assessment.bmi} unit="kg/m²" />
          <ResultsCell
            label="% Gordura"
            value={assessment.body_fat_pct}
            unit="%"
          />
          <ResultsCell
            label="Massa magra"
            value={assessment.lean_mass_kg}
            unit="kg"
          />
          <ResultsCell
            label="Massa gorda"
            value={assessment.fat_mass_kg}
            unit="kg"
          />
        </View>

        {/* Composition */}
        <Text style={styles.sectionTitle}>Composição</Text>
        <DataTable
          rows={[
            { label: 'Peso', value: assessment.weight_kg, unit: 'kg' },
            { label: 'Altura', value: assessment.height_cm, unit: 'cm' },
            ...sites.map((site) => ({
              label: SKINFOLD_SITE_LABELS[site],
              value: assessment[SKINFOLD_FIELD[site]] as number | null,
              unit: 'mm',
            })),
          ]}
        />

        {/* Perimeters */}
        <Text style={styles.sectionTitle}>Perímetros</Text>
        <DataTable
          rows={PERIMETERS.map((p) => ({
            label: p.label,
            value: assessment[p.key] as number | null,
            unit: 'cm',
          }))}
        />

        {/* Notes */}
        {assessment.notes ? (
          <>
            <Text style={styles.sectionTitle}>Observações</Text>
            <View style={styles.notesBox}>
              <Text>{assessment.notes}</Text>
            </View>
          </>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Gerado em {formatDateTime(new Date())}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>

      {hasPhotos ? (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Fotos</Text>
              <Text style={styles.headerSubtitle}>
                {studentName ?? 'Aluno sem nome'} · {formatDate(assessment.performed_on)}
              </Text>
            </View>
          </View>

          <View style={[styles.photosGrid, { marginTop: 16 }]}>
            {(['front', 'back', 'left', 'right'] as const).map((position) => {
              const photo = indexedPhotos[position];
              return (
                <View key={position} style={styles.photoTile}>
                  {photo?.signed_url ? (
                    // <Image> here is the @react-pdf/renderer primitive (PDF
                    // canvas), not a DOM <img>; it has no `alt` prop.
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <Image src={photo.signed_url} style={styles.photo} />
                  ) : (
                    <View
                      style={[
                        styles.photo,
                        {
                          backgroundColor: COLORS.surface,
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      ]}
                    >
                      <Text style={{ color: COLORS.muted, fontSize: 8 }}>
                        sem foto
                      </Text>
                    </View>
                  )}
                  <Text style={styles.photoLabel}>{PHOTO_LABELS[position]}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.footer} fixed>
            <Text>Gerado em {formatDateTime(new Date())}</Text>
            <Text
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
              }
            />
          </View>
        </Page>
      ) : null}
    </Document>
  );
}

function ResultsCell({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <View style={styles.resultsCell}>
      <Text style={styles.resultsLabel}>{label}</Text>
      <Text style={styles.resultsValue}>
        {formatNumber(value, 1)}
        {value != null ? <Text style={styles.resultsUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

function DataTable({
  rows,
}: {
  rows: { label: string; value: number | null; unit: string }[];
}) {
  const visible = rows.filter((r) => r.value != null);
  if (visible.length === 0) {
    return (
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableLabel, { color: COLORS.muted }]}>
            Sem dados informados.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.tableLabel]}>Métrica</Text>
        <Text style={[styles.tableHeaderCell, styles.tableValue]}>Valor</Text>
      </View>
      {visible.map((row) => (
        <View key={row.label} style={styles.tableRow}>
          <Text style={styles.tableLabel}>{row.label}</Text>
          <Text style={styles.tableValue}>
            {formatNumber(row.value, 1)} {row.unit}
          </Text>
        </View>
      ))}
    </View>
  );
}

function formatNumber(value: number | null, precision: number): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toFixed(precision).replace('.', ',');
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
