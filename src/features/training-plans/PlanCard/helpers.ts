import type { ScheduleConfig } from '@/core/domain';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function formatSchedule(config: ScheduleConfig): string {
  if (config.type === 'weekdays') {
    if (!config.days.length) return 'Sem dias definidos';
    return config.days.map((d) => DAY_LABELS[d]).join(', ');
  }
  if (config.type === 'interval') {
    return `A cada ${config.interval_days} dias`;
  }
  return `Ciclo de ${config.cycle_length} dias`;
}

export function formatDateRange(start: string, end: string | null): string {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  return end ? `${fmt(start)} → ${fmt(end)}` : `A partir de ${fmt(start)}`;
}
