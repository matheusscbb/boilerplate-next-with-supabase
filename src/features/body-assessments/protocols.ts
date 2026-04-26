// =============================================================================
// Pure body-composition math.
// Each protocol receives only the values it needs and returns body density
// (when applicable) plus body fat %. Unrelated UI concerns live elsewhere.
// =============================================================================

import type {
  AssessmentSex,
  AssessmentType,
  SkinfoldProtocol,
} from '@/core/domain';

// ─── Site catalog ──────────────────────────────────────────────────────────

/**
 * Stable identifiers for every anatomical skinfold site we record. Keys map
 * 1:1 to the `skf_*_mm` columns on `body_assessments`.
 */
export type SkinfoldSite =
  | 'chest'
  | 'abdomen'
  | 'thigh'
  | 'triceps'
  | 'subscapular'
  | 'suprailiac'
  | 'axillary'
  | 'calf';

export const SKINFOLD_SITE_LABELS: Record<SkinfoldSite, string> = {
  chest: 'Peitoral',
  abdomen: 'Abdômen',
  thigh: 'Coxa',
  triceps: 'Tríceps',
  subscapular: 'Subescapular',
  suprailiac: 'Suprailíaca',
  axillary: 'Axilar média',
  calf: 'Panturrilha',
};

export const SKINFOLD_SITE_TO_COLUMN: Record<SkinfoldSite, keyof SkinfoldValues> = {
  chest: 'chest',
  abdomen: 'abdomen',
  thigh: 'thigh',
  triceps: 'triceps',
  subscapular: 'subscapular',
  suprailiac: 'suprailiac',
  axillary: 'axillary',
  calf: 'calf',
};

export type SkinfoldValues = Partial<Record<SkinfoldSite, number | null>>;

// ─── Protocol metadata ─────────────────────────────────────────────────────

export interface ProtocolDefinition {
  id: SkinfoldProtocol;
  label: string;
  /** Sites required to compute the result, indexed by sex. */
  sites: Record<AssessmentSex, SkinfoldSite[]>;
  /** Whether age is required. Pollock-derived protocols depend on it. */
  requiresAge: boolean;
}

export const PROTOCOLS: Record<SkinfoldProtocol, ProtocolDefinition> = {
  pollock_3: {
    id: 'pollock_3',
    label: 'Pollock 3 Dobras',
    sites: {
      male: ['chest', 'abdomen', 'thigh'],
      female: ['triceps', 'suprailiac', 'thigh'],
    },
    requiresAge: true,
  },
  pollock_7: {
    id: 'pollock_7',
    label: 'Pollock 7 Dobras',
    sites: {
      male: [
        'chest',
        'axillary',
        'triceps',
        'subscapular',
        'abdomen',
        'suprailiac',
        'thigh',
      ],
      female: [
        'chest',
        'axillary',
        'triceps',
        'subscapular',
        'abdomen',
        'suprailiac',
        'thigh',
      ],
    },
    requiresAge: true,
  },
  guedes: {
    id: 'guedes',
    label: 'Guedes (7 Dobras)',
    sites: {
      // Guedes 7-dobras (uso comum no Brasil): subescapular, axilar média,
      // peitoral, tricipital, suprailíaca, abdominal e coxa. Mesmos sites
      // para ambos os sexos — a fórmula em si é unissex.
      male: [
        'subscapular',
        'axillary',
        'chest',
        'triceps',
        'suprailiac',
        'abdomen',
        'thigh',
      ],
      female: [
        'subscapular',
        'axillary',
        'chest',
        'triceps',
        'suprailiac',
        'abdomen',
        'thigh',
      ],
    },
    requiresAge: false,
  },
  faulkner: {
    id: 'faulkner',
    label: 'Faulkner (4 Dobras)',
    sites: {
      male: ['triceps', 'subscapular', 'suprailiac', 'abdomen'],
      female: ['triceps', 'subscapular', 'suprailiac', 'abdomen'],
    },
    requiresAge: false,
  },
};

export const PROTOCOL_OPTIONS: ProtocolDefinition[] = [
  PROTOCOLS.pollock_3,
  PROTOCOLS.pollock_7,
  PROTOCOLS.guedes,
  PROTOCOLS.faulkner,
];

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Convert body density (g/cm³) to body fat % using Siri (1961). */
export function siriBodyFatPercent(density: number): number {
  return 495 / density - 450;
}

export function calcBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function calcAgeYears(birthDate: string, today = new Date()): number {
  // YYYY-MM-DD parser independent of timezone.
  const [y, m, d] = birthDate.split('-').map((n) => Number.parseInt(n, 10));
  if (!y || !m || !d) return Number.NaN;
  let age = today.getFullYear() - y;
  const beforeBirthday =
    today.getMonth() + 1 < m ||
    (today.getMonth() + 1 === m && today.getDate() < d);
  if (beforeBirthday) age -= 1;
  return age;
}

function sumSites(values: SkinfoldValues, sites: SkinfoldSite[]): number | null {
  let total = 0;
  for (const site of sites) {
    const v = values[site];
    if (v === null || v === undefined || Number.isNaN(v)) return null;
    total += v;
  }
  return total;
}

// ─── Density formulas ──────────────────────────────────────────────────────

function pollock3Density(
  sex: AssessmentSex,
  sumMm: number,
  ageYears: number
): number {
  if (sex === 'male') {
    return (
      1.10938 -
      0.0008267 * sumMm +
      0.0000016 * sumMm * sumMm -
      0.0002574 * ageYears
    );
  }
  return (
    1.0994921 -
    0.0009929 * sumMm +
    0.0000023 * sumMm * sumMm -
    0.0001392 * ageYears
  );
}

function pollock7Density(
  sex: AssessmentSex,
  sumMm: number,
  ageYears: number
): number {
  if (sex === 'male') {
    return (
      1.112 -
      0.00043499 * sumMm +
      0.00000055 * sumMm * sumMm -
      0.00028826 * ageYears
    );
  }
  return (
    1.097 -
    0.00046971 * sumMm +
    0.00000056 * sumMm * sumMm -
    0.00012828 * ageYears
  );
}

function guedesDensity(sumMm: number): number {
  // Guedes (7 dobras): Dc = 1.1714 - 0.063 * log10(Σ7)
  // Equação logarítmica unissex usada em Educação Física no Brasil.
  return 1.1714 - 0.063 * Math.log10(sumMm);
}

function faulknerBodyFatPct(sumMm: number): number {
  return sumMm * 0.153 + 5.783;
}

// ─── Public API ────────────────────────────────────────────────────────────

export interface ComputedMetrics {
  bmi: number | null;
  bodyDensity: number | null;
  bodyFatPct: number | null;
  leanMassKg: number | null;
  fatMassKg: number | null;
}

export interface ComputeMetricsInput {
  assessmentType: AssessmentType;
  protocol: SkinfoldProtocol | null;
  sex: AssessmentSex | null;
  ageYears: number | null;
  weightKg: number | null;
  heightCm: number | null;
  skinfolds: SkinfoldValues;
  /** Direct readings used when assessmentType === 'bioimpedance'. */
  biaBodyFatPct?: number | null;
  biaLeanMassKg?: number | null;
  biaFatMassKg?: number | null;
}

/**
 * Single entry-point used by the form (live preview) and the persistence layer
 * (snapshot the row before insert/update). Pure: no DOM, no Supabase.
 */
export function computeMetrics(input: ComputeMetricsInput): ComputedMetrics {
  const bmi =
    input.weightKg && input.heightCm
      ? round(calcBmi(input.weightKg, input.heightCm), 2)
      : null;

  let bodyDensity: number | null = null;
  let bodyFatPct: number | null = null;

  if (input.assessmentType === 'bioimpedance') {
    bodyFatPct =
      typeof input.biaBodyFatPct === 'number' && !Number.isNaN(input.biaBodyFatPct)
        ? input.biaBodyFatPct
        : null;
  } else if (input.protocol && input.sex) {
    const protocol = PROTOCOLS[input.protocol];
    const sites = protocol.sites[input.sex];
    const sum = sumSites(input.skinfolds, sites);

    if (sum !== null && sum > 0) {
      switch (input.protocol) {
        case 'pollock_3':
          if (input.ageYears != null) {
            bodyDensity = pollock3Density(input.sex, sum, input.ageYears);
            bodyFatPct = siriBodyFatPercent(bodyDensity);
          }
          break;
        case 'pollock_7':
          if (input.ageYears != null) {
            bodyDensity = pollock7Density(input.sex, sum, input.ageYears);
            bodyFatPct = siriBodyFatPercent(bodyDensity);
          }
          break;
        case 'guedes':
          bodyDensity = guedesDensity(sum);
          bodyFatPct = siriBodyFatPercent(bodyDensity);
          break;
        case 'faulkner':
          // Faulkner predicts %fat directly without going through density.
          bodyFatPct = faulknerBodyFatPct(sum);
          break;
      }
    }
  }

  // Mass derivations: prefer device-reported values when available, otherwise
  // derive from weight + body fat %.
  let leanMassKg: number | null = null;
  let fatMassKg: number | null = null;

  if (
    input.assessmentType === 'bioimpedance' &&
    typeof input.biaLeanMassKg === 'number' &&
    typeof input.biaFatMassKg === 'number'
  ) {
    leanMassKg = input.biaLeanMassKg;
    fatMassKg = input.biaFatMassKg;
  } else if (input.weightKg != null && bodyFatPct != null) {
    fatMassKg = (input.weightKg * bodyFatPct) / 100;
    leanMassKg = input.weightKg - fatMassKg;
  }

  return {
    bmi,
    bodyDensity: bodyDensity != null ? round(bodyDensity, 5) : null,
    bodyFatPct: bodyFatPct != null ? round(bodyFatPct, 2) : null,
    leanMassKg: leanMassKg != null ? round(leanMassKg, 2) : null,
    fatMassKg: fatMassKg != null ? round(fatMassKg, 2) : null,
  };
}

function round(n: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}
