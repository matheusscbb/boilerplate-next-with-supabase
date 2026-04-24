'use client';

import { memo, useMemo } from 'react';
import type { CalendarProps, CalendarDayMarker } from './Calendar.types';

// ─── Date helpers (ISO `YYYY-MM-DD`, timezone-agnostic) ──────────────────────

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Day cell ─────────────────────────────────────────────────────────────────

interface DayCellProps {
  iso: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  marker?: CalendarDayMarker;
  onSelect: (iso: string) => void;
}

const DayCell = memo(function DayCell({
  iso,
  dayNumber,
  inCurrentMonth,
  isSelected,
  isToday,
  marker,
  onSelect,
}: DayCellProps) {
  const scheduled = marker?.scheduled;
  const logged = marker?.logged;

  return (
    <button
      type="button"
      onClick={() => onSelect(iso)}
      aria-label={iso}
      aria-pressed={isSelected}
      className={[
        'relative flex aspect-square flex-col items-center justify-center rounded-md text-sm transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        !inCurrentMonth && 'text-muted-foreground/50',
        inCurrentMonth && !isSelected && 'text-foreground hover:bg-muted',
        isSelected && 'bg-primary text-white shadow-sm',
        !isSelected && isToday && 'ring-1 ring-primary ring-inset',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="font-medium leading-none">{dayNumber}</span>
      {(scheduled || logged) && (
        <span className="absolute bottom-1 flex items-center gap-0.5">
          {scheduled && (
            <span
              aria-hidden="true"
              className={[
                'h-1.5 w-1.5 rounded-full',
                isSelected ? 'bg-white' : 'bg-primary',
              ].join(' ')}
            />
          )}
          {logged && (
            <span
              aria-hidden="true"
              className={[
                'h-1.5 w-1.5 rounded-full',
                isSelected ? 'bg-white' : 'bg-green-500',
              ].join(' ')}
            />
          )}
        </span>
      )}
    </button>
  );
});

// ─── Calendar root ───────────────────────────────────────────────────────────

function CalendarRoot({
  selectedDate,
  monthDate,
  markers,
  today,
  weekStartsOn = 0,
  locale = 'pt-BR',
  onSelectDate,
  onChangeMonth,
  className = '',
}: CalendarProps) {
  const todayIso = today ?? toISODate(new Date());
  const monthStart = startOfMonth(parseISODate(monthDate));

  const monthTitle = useMemo(
    () =>
      capitalize(
        new Intl.DateTimeFormat(locale, {
          month: 'long',
          year: 'numeric',
        }).format(monthStart)
      ),
    [locale, monthStart]
  );

  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const ref = new Date(2024, 0, 7); // Sunday = Jan 7 2024
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ref);
      d.setDate(ref.getDate() + ((i + weekStartsOn) % 7));
      return fmt.format(d).replace('.', '').slice(0, 3);
    });
  }, [locale, weekStartsOn]);

  const cells = useMemo(() => {
    const total = daysInMonth(monthStart);
    const firstWeekday = monthStart.getDay(); // 0 = Sun
    const leading = (firstWeekday - weekStartsOn + 7) % 7;
    const out: Array<{ iso: string; dayNumber: number; inCurrentMonth: boolean }> = [];

    // Leading (previous month)
    for (let i = leading; i > 0; i -= 1) {
      const d = new Date(monthStart);
      d.setDate(monthStart.getDate() - i);
      out.push({ iso: toISODate(d), dayNumber: d.getDate(), inCurrentMonth: false });
    }
    // Current month
    for (let d = 1; d <= total; d += 1) {
      const day = new Date(monthStart.getFullYear(), monthStart.getMonth(), d);
      out.push({ iso: toISODate(day), dayNumber: d, inCurrentMonth: true });
    }
    // Trailing to complete 6 rows (42 cells) for stable layout
    while (out.length % 7 !== 0 || out.length < 42) {
      const last = out[out.length - 1];
      const d = parseISODate(last.iso);
      d.setDate(d.getDate() + 1);
      out.push({ iso: toISODate(d), dayNumber: d.getDate(), inCurrentMonth: false });
    }
    return out.slice(0, 42);
  }, [monthStart, weekStartsOn]);

  const handlePrev = () => onChangeMonth?.(toISODate(addMonths(monthStart, -1)));
  const handleNext = () => onChangeMonth?.(toISODate(addMonths(monthStart, 1)));
  const handleToday = () => {
    onChangeMonth?.(toISODate(startOfMonth(parseISODate(todayIso))));
    onSelectDate(todayIso);
  };

  return (
    <div
      className={[
        'rounded-lg border border-border bg-background p-3 shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Mês anterior"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          ‹
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          <span className="text-sm font-semibold text-foreground">{monthTitle}</span>
          <button
            type="button"
            onClick={handleToday}
            className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Hoje
          </button>
        </div>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Próximo mês"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {weekdayLabels.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => (
          <DayCell
            key={cell.iso}
            iso={cell.iso}
            dayNumber={cell.dayNumber}
            inCurrentMonth={cell.inCurrentMonth}
            isSelected={cell.iso === selectedDate}
            isToday={cell.iso === todayIso}
            marker={markers?.[cell.iso]}
            onSelect={onSelectDate}
          />
        ))}
      </div>
    </div>
  );
}

export const Calendar = Object.assign(CalendarRoot, { Day: DayCell });
