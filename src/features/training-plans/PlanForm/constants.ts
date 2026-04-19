export const WEEKDAY_LABELS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const INITIAL_WEEKDAYS = [1, 3, 5];

/**
 * When a set of the key muscle is performed, the value muscle gains 0.5
 * indirect sets.
 */
export const INDIRECT_VOLUME: Partial<Record<string, string>> = {
  Costas: 'Bíceps',
  Peito: 'Tríceps',
};
