'use client';

import { useId, useMemo, useState } from 'react';

export interface EvolutionPoint {
  /** ISO date used as label. */
  date: string;
  /** Plotted value. `null` skips the point but keeps the date in the axis. */
  value: number | null;
}

export interface EvolutionChartProps {
  title: string;
  unit: string;
  points: EvolutionPoint[];
  /** Stroke color override; defaults to `var(--color-primary)`. */
  color?: string;
  /** Optional background subtitle (e.g. last value badge). */
  subtitle?: string;
  /** When true, downward trend is positive (e.g. body fat). Drives the badge color. */
  invertColors?: boolean;
  /** Number of decimals shown in tooltips/badges. */
  precision?: number;
  className?: string;
}

const VIEWBOX_WIDTH = 320;
const VIEWBOX_HEIGHT = 110;
const PADDING_X = 24;
const PADDING_Y = 14;

/**
 * Lightweight time-series line chart rendered as inline SVG. No deps, no
 * canvas — the surface is small (one metric at a time), so we render
 * straight to a 320×110 viewBox and stretch via 100% width.
 *
 * The chart is hover-aware: pointing at any of the data dots reveals an
 * inline tooltip with the date and value. Empty / single-point datasets
 * fall back to a neutral state so we never throw at the user.
 */
export function EvolutionChart({
  title,
  unit,
  points,
  color = 'var(--color-primary)',
  subtitle,
  invertColors,
  precision = 1,
  className = '',
}: EvolutionChartProps) {
  const gradId = useId();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Filter to plottable points (those with a numeric value) for the geometry,
  // but keep the original ordering for axis labelling.
  const plotPoints = useMemo(
    () =>
      points.flatMap((p, i) =>
        p.value == null || Number.isNaN(p.value) ? [] : [{ ...p, originalIndex: i }]
      ),
    [points]
  );

  const { min, max } = useMemo(() => {
    if (plotPoints.length === 0) return { min: 0, max: 1 };
    let lo = Number.POSITIVE_INFINITY;
    let hi = Number.NEGATIVE_INFINITY;
    for (const p of plotPoints) {
      lo = Math.min(lo, p.value as number);
      hi = Math.max(hi, p.value as number);
    }
    if (lo === hi) {
      // Avoid a flat division-by-zero scale; pad the y-axis slightly.
      const pad = Math.max(0.5, Math.abs(lo) * 0.05);
      return { min: lo - pad, max: hi + pad };
    }
    // Add 8% padding on top/bottom so points don't touch the edges.
    const pad = (hi - lo) * 0.08;
    return { min: lo - pad, max: hi + pad };
  }, [plotPoints]);

  const xFor = (idx: number, total: number) => {
    if (total <= 1) return VIEWBOX_WIDTH / 2;
    const span = VIEWBOX_WIDTH - PADDING_X * 2;
    return PADDING_X + (idx / (total - 1)) * span;
  };

  const yFor = (value: number) => {
    const span = VIEWBOX_HEIGHT - PADDING_Y * 2;
    const ratio = (value - min) / (max - min || 1);
    return PADDING_Y + (1 - ratio) * span;
  };

  const coords = plotPoints.map((p, i) => ({
    x: xFor(i, plotPoints.length),
    y: yFor(p.value as number),
    point: p,
  }));

  const linePath = coords.length
    ? coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(' ')
    : '';

  const areaPath = coords.length
    ? `${linePath} L${coords[coords.length - 1].x.toFixed(2)},${VIEWBOX_HEIGHT - PADDING_Y} L${coords[0].x.toFixed(2)},${VIEWBOX_HEIGHT - PADDING_Y} Z`
    : '';

  const last = plotPoints[plotPoints.length - 1] ?? null;
  const first = plotPoints[0] ?? null;
  const totalDelta =
    last && first && last !== first ? (last.value as number) - (first.value as number) : null;

  return (
    <div
      className={['rounded-xl border border-border bg-background p-4', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
            {last
              ? `${(last.value as number).toFixed(precision).replace('.', ',')} ${unit}`
              : '—'}
          </p>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {totalDelta != null && Math.abs(totalDelta) >= 10 ** -precision / 2 && (
          <DeltaBadge
            value={totalDelta}
            unit={unit}
            precision={precision}
            invertColors={invertColors}
          />
        )}
      </div>

      {plotPoints.length === 0 ? (
        <div className="flex h-[110px] items-center justify-center rounded-md bg-muted/30 text-xs text-muted-foreground">
          Sem dados suficientes
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            className="block h-[110px] w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Gráfico de evolução: ${title}`}
          >
            <defs>
              <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Subtle baseline grid */}
            <line
              x1={PADDING_X}
              x2={VIEWBOX_WIDTH - PADDING_X}
              y1={VIEWBOX_HEIGHT - PADDING_Y}
              y2={VIEWBOX_HEIGHT - PADDING_Y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-border"
            />

            {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {coords.map((c, i) => (
              <g key={`${c.point.date}-${i}`}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={hoverIdx === i ? 3.4 : 2.4}
                  fill="var(--color-background)"
                  stroke={color}
                  strokeWidth="1.4"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Wide invisible hit-area for easier hovering */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={9}
                  fill="transparent"
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onTouchStart={() => setHoverIdx(i)}
                  onTouchEnd={() => setHoverIdx(null)}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            ))}
          </svg>

          {hoverIdx != null && coords[hoverIdx] && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border border-border bg-background px-2 py-1 text-[11px] shadow-md"
              style={{
                left: `${(coords[hoverIdx].x / VIEWBOX_WIDTH) * 100}%`,
                top: `${(coords[hoverIdx].y / VIEWBOX_HEIGHT) * 100}%`,
              }}
            >
              <p className="font-medium text-foreground">
                {(coords[hoverIdx].point.value as number)
                  .toFixed(precision)
                  .replace('.', ',')}{' '}
                {unit}
              </p>
              <p className="text-muted-foreground">
                {formatShortDate(coords[hoverIdx].point.date)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeltaBadge({
  value,
  unit,
  precision,
  invertColors,
}: {
  value: number;
  unit: string;
  precision: number;
  invertColors?: boolean;
}) {
  const positive = invertColors ? value < 0 : value > 0;
  return (
    <span
      className={[
        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums',
        positive
          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
          : 'bg-destructive/10 text-destructive',
      ].join(' ')}
    >
      {value > 0 ? '+' : ''}
      {value.toFixed(precision).replace('.', ',')} {unit}
    </span>
  );
}

function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y.slice(2)}`;
}
