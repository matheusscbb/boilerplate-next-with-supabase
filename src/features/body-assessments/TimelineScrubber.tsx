'use client';

import { useId, useMemo } from 'react';
import type { BodyAssessmentSummary } from '@/core/domain';

export interface TimelineScrubberProps {
  /** Assessments to render. Order doesn't matter — sorted ascending internally. */
  rows: BodyAssessmentSummary[];
  /** Currently selected "antes" assessment id. */
  fromId: string | null;
  /** Currently selected "depois" assessment id. */
  toId: string | null;
  /** Called when a dot is clicked; the closer handle is moved to that row. */
  onSelect: (slot: 'from' | 'to', assessmentId: string) => void;
}

/**
 * Horizontal scrubber showing the full assessment timeline with two snap-to
 * handles (Antes / Depois). Clicking any dot moves the *nearest* handle to
 * that point — so trainers can sweep forward/backward without juggling two
 * separate dropdowns.
 *
 * Renders pure HTML/SVG (no chart deps) and stays responsive via 100% width
 * + a 4:1ish aspect track.
 */
export function TimelineScrubber({
  rows,
  fromId,
  toId,
  onSelect,
}: TimelineScrubberProps) {
  const trackId = useId();

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) =>
        a.performed_on.localeCompare(b.performed_on)
      ),
    [rows]
  );

  const fromIdx = sorted.findIndex((r) => r.id === fromId);
  const toIdx = sorted.findIndex((r) => r.id === toId);

  const handleClick = (idx: number) => {
    const target = sorted[idx];
    if (!target) return;
    if (idx === fromIdx || idx === toIdx) return;

    if (fromIdx === -1) {
      onSelect('from', target.id);
      return;
    }
    if (toIdx === -1) {
      onSelect('to', target.id);
      return;
    }

    // Both slots filled → move the closer handle to the click.
    const dFrom = Math.abs(idx - fromIdx);
    const dTo = Math.abs(idx - toIdx);
    onSelect(dFrom <= dTo ? 'from' : 'to', target.id);
  };

  if (sorted.length === 0) return null;

  const xFor = (idx: number) => {
    if (sorted.length === 1) return 50;
    return (idx / (sorted.length - 1)) * 100;
  };

  const minIdx = Math.min(
    fromIdx === -1 ? Infinity : fromIdx,
    toIdx === -1 ? Infinity : toIdx
  );
  const maxIdx = Math.max(fromIdx, toIdx);
  const showRange = minIdx !== Infinity && maxIdx !== -1 && minIdx !== maxIdx;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
        <span>Mais antiga</span>
        <span>Linha do tempo · {sorted.length} avaliações</span>
        <span>Mais recente</span>
      </div>

      <div
        className="relative h-12"
        role="group"
        aria-labelledby={trackId}
      >
        <span id={trackId} className="sr-only">
          Linha do tempo de avaliações
        </span>
        {/* Base track */}
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border" />

        {/* Range highlight between handles */}
        {showRange && (
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary/30"
            style={{
              left: `${xFor(minIdx)}%`,
              width: `${xFor(maxIdx) - xFor(minIdx)}%`,
            }}
          />
        )}

        {/* Dots */}
        {sorted.map((row, idx) => {
          const isFrom = idx === fromIdx;
          const isTo = idx === toIdx;
          const isSelected = isFrom || isTo;
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => handleClick(idx)}
              aria-label={`Selecionar avaliação de ${formatLongDate(row.performed_on)}`}
              aria-pressed={isSelected}
              title={formatLongDate(row.performed_on)}
              className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{ left: `${xFor(idx)}%` }}
            >
              <span
                className={[
                  'block rounded-full transition-all',
                  isSelected
                    ? 'h-4 w-4 bg-primary ring-2 ring-background'
                    : 'h-2.5 w-2.5 bg-muted-foreground/40 hover:bg-primary hover:scale-125',
                ].join(' ')}
              />
              {isSelected && (
                <span
                  className={[
                    'absolute whitespace-nowrap rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold shadow-sm',
                    isFrom ? 'text-primary' : 'text-foreground',
                  ].join(' ')}
                  style={{ top: 'calc(100% + 6px)' }}
                >
                  {isFrom ? 'Antes' : 'Depois'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          {fromIdx >= 0 ? (
            <>
              <span className="font-semibold text-foreground">Antes:</span>{' '}
              {formatLongDate(sorted[fromIdx].performed_on)}
            </>
          ) : (
            <span className="italic">Selecione &quot;antes&quot; clicando em um ponto.</span>
          )}
        </span>
        <span>
          {toIdx >= 0 ? (
            <>
              <span className="font-semibold text-foreground">Depois:</span>{' '}
              {formatLongDate(sorted[toIdx].performed_on)}
            </>
          ) : (
            <span className="italic">Selecione &quot;depois&quot; clicando em um ponto.</span>
          )}
        </span>
      </div>
    </div>
  );
}

function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
