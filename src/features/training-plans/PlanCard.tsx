'use client';

import Link from 'next/link';
import type { ScheduleConfig } from '@/core/domain';

// ─── Types ─────────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export interface PlanCardData {
  id: string;
  name: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  schedule_type: string;
  schedule_config: ScheduleConfig;
  day_count: number;
  student_name?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSchedule(config: ScheduleConfig): string {
  if (config.type === 'weekdays') {
    if (!config.days.length) return 'Sem dias definidos';
    return config.days.map((d) => DAY_LABELS[d]).join(', ');
  }
  if (config.type === 'interval') {
    return `A cada ${config.interval_days} dias`;
  }
  return `Ciclo de ${config.cycle_length} dias`;
}

function formatDateRange(start: string, end: string | null): string {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  return end ? `${fmt(start)} → ${fmt(end)}` : `A partir de ${fmt(start)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlanCard({ plan }: { plan: PlanCardData }) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-background p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Active badge */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground leading-snug">
          {plan.name}
        </h3>
        <span
          className={[
            'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
            plan.is_active
              ? 'bg-success/15 text-success'
              : 'bg-muted text-muted-foreground',
          ].join(' ')}
        >
          {plan.is_active ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Meta info */}
      <div className="flex-1 space-y-2">
        {plan.student_name && (
          <Row
            icon={<UserIcon />}
            text={plan.student_name}
          />
        )}
        <Row
          icon={<CalendarIcon />}
          text={formatDateRange(plan.start_date, plan.end_date)}
        />
        <Row
          icon={<RepeatIcon />}
          text={formatSchedule(plan.schedule_config)}
        />
        <Row
          icon={<DumbbellIcon />}
          text={`${plan.day_count} ${plan.day_count === 1 ? 'dia de treino' : 'dias de treino'}`}
        />
      </div>

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-border">
        <Link
          href={`/plano-de-treino/${plan.id}`}
          className="text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Ver plano →
        </Link>
      </div>
    </div>
  );
}

// ─── Row helper ───────────────────────────────────────────────────────────────

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-foreground-secondary">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

// ─── Inline icons ─────────────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="m17 2 4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M14.4 14.4 9.6 9.6" /><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" /><path d="m21.5 21.5-1.4-1.4" /><path d="M3.9 3.9 2.5 2.5" /><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829 2 2 0 1 1 2.828 2.829l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="8" r="5" /><path d="M3 21a9 9 0 0 1 18 0" />
    </svg>
  );
}
