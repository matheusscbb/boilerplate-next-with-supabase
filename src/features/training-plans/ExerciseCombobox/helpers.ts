import { EXERCISE_CATEGORIES } from '@/shared/constants';
import type { Exercise } from '@/core/domain';

/** Strip diacritics and non-alphanumeric chars for case/accent-insensitive matching. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

/** Flatten filtered exercises, preserving the canonical category order for keyboard nav. */
export function buildFlatList(filtered: Exercise[]): Exercise[] {
  const result: Exercise[] = [];
  for (const cat of EXERCISE_CATEGORIES) {
    for (const ex of filtered) {
      if (ex.category === cat) result.push(ex);
    }
  }
  return result;
}
