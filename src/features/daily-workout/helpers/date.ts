// =============================================================================
// Pure date helpers. All dates travel as ISO strings `YYYY-MM-DD` to avoid
// timezone drift between server (UTC) and browser (local).
// =============================================================================

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Inclusive day diff (a - b) in whole days, using local calendar dates. */
export function diffInDays(a: string, b: string): number {
  const da = parseISODate(a);
  const db = parseISODate(b);
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((da.getTime() - db.getTime()) / MS);
}

export function startOfMonthISO(iso: string): string {
  const d = parseISODate(iso);
  return toISODate(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function endOfMonthISO(iso: string): string {
  const d = parseISODate(iso);
  return toISODate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function eachDayOfMonth(iso: string): string[] {
  const d = parseISODate(iso);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return Array.from({ length: last }, (_, i) =>
    toISODate(new Date(d.getFullYear(), d.getMonth(), i + 1))
  );
}

export type DayMode = 'past' | 'today' | 'future';

export function classifyDate(iso: string, reference: string = todayISO()): DayMode {
  if (iso === reference) return 'today';
  return iso < reference ? 'past' : 'future';
}
