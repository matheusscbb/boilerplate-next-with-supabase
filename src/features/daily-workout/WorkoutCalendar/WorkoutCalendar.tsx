'use client';

import { useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/design-system';
import { buildMonthMarkers, startOfMonthISO } from '../helpers';
import type { WorkoutCalendarProps } from '../types';

export function WorkoutCalendar({
  plan,
  selectedDate,
  monthISO,
  monthSessions,
  today,
}: WorkoutCalendarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const markers = useMemo(
    () => buildMonthMarkers(plan, monthSessions, monthISO),
    [plan, monthSessions, monthISO]
  );

  const navigateTo = (iso: string) => {
    startTransition(() => {
      router.replace(`/treinos?date=${iso}`, { scroll: false });
    });
  };

  const onSelect = (iso: string) => navigateTo(iso);

  const onChangeMonth = (iso: string) => {
    const monthStart = startOfMonthISO(iso);
    // When changing months, default selection to first day of that month
    // unless the month contains today.
    const target = today.startsWith(monthStart.slice(0, 7)) ? today : monthStart;
    navigateTo(target);
  };

  return (
    <div
      className={[
        'transition-opacity',
        isPending && 'opacity-70',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Calendar
        selectedDate={selectedDate}
        monthDate={monthISO}
        markers={markers}
        today={today}
        weekStartsOn={0}
        onSelectDate={onSelect}
        onChangeMonth={onChangeMonth}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Agendado
        </span>
        <span className="inline-flex items-center gap-1">
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
          Registrado
        </span>
      </div>
    </div>
  );
}
