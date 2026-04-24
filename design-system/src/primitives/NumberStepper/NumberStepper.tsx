'use client';

import { useCallback, useEffect, useState } from 'react';
import type { NumberStepperProps } from './NumberStepper.types';

const sizeStyles = {
  sm: { wrap: 'h-8', btn: 'w-7 text-xs', input: 'text-sm' },
  md: { wrap: 'h-10', btn: 'w-9 text-sm', input: 'text-sm' },
};

function clamp(value: number, min?: number, max?: number) {
  let next = value;
  if (typeof min === 'number' && next < min) next = min;
  if (typeof max === 'number' && next > max) next = max;
  return next;
}

function format(value: number | null, precision: number) {
  if (value === null || Number.isNaN(value)) return '';
  return precision > 0 ? value.toFixed(precision).replace(/\.?0+$/, '') : String(value);
}

export function NumberStepper({
  ref,
  value,
  onChange,
  min,
  max,
  step = 1,
  precision = 0,
  placeholder = '',
  disabled = false,
  readOnly = false,
  error,
  suffix,
  size = 'md',
  id,
  name,
  className = '',
  ...rest
}: NumberStepperProps) {
  const [draft, setDraft] = useState<string>(format(value, precision));

  useEffect(() => {
    setDraft(format(value, precision));
  }, [value, precision]);

  const commitDelta = useCallback(
    (delta: number) => {
      if (disabled || readOnly) return;
      const base = value ?? min ?? 0;
      const next = clamp(Number((base + delta).toFixed(precision > 0 ? precision : 0)), min, max);
      onChange(next);
    },
    [value, min, max, precision, onChange, disabled, readOnly]
  );

  const s = sizeStyles[size];

  return (
    <div
      className={[
        'inline-flex items-stretch rounded-md border bg-transparent overflow-hidden',
        s.wrap,
        error ? 'border-destructive focus-within:ring-destructive' : 'border-border',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        aria-label="Diminuir"
        onClick={() => commitDelta(-step)}
        disabled={disabled || readOnly || (typeof min === 'number' && (value ?? min) <= min)}
        className={[
          'flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed',
          s.btn,
        ].join(' ')}
        tabIndex={-1}
      >
        −
      </button>
      <input
        ref={ref}
        id={id}
        name={name}
        type="text"
        inputMode={precision > 0 ? 'decimal' : 'numeric'}
        pattern={precision > 0 ? '[0-9]*[.,]?[0-9]*' : '[0-9]*'}
        value={draft}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(e) => {
          const raw = e.target.value.replace(',', '.');
          setDraft(e.target.value);
          if (raw === '') {
            onChange(null);
            return;
          }
          const parsed = Number(raw);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
        onBlur={() => {
          if (value === null) {
            setDraft('');
            return;
          }
          const next = clamp(value, min, max);
          if (next !== value) onChange(next);
          setDraft(format(next, precision));
        }}
        className={[
          'min-w-0 flex-1 bg-transparent px-1 text-center text-foreground outline-none placeholder:text-muted-foreground',
          s.input,
        ].join(' ')}
        {...rest}
      />
      {suffix && (
        <span className="flex items-center px-2 text-xs text-muted-foreground select-none">
          {suffix}
        </span>
      )}
      <button
        type="button"
        aria-label="Aumentar"
        onClick={() => commitDelta(step)}
        disabled={disabled || readOnly || (typeof max === 'number' && (value ?? 0) >= max)}
        className={[
          'flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed',
          s.btn,
        ].join(' ')}
        tabIndex={-1}
      >
        +
      </button>
    </div>
  );
}
