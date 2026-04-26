'use client';

import { useId } from 'react';
import { Field, NumberStepper } from '@/design-system';

export interface MetricNumberFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  unit: string;
  /** Decimal precision shown by the stepper (default 1 — typical for kg/cm/mm). */
  precision?: number;
  /** Optional min/max for validation feedback. */
  min?: number;
  max?: number;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  /** Manual id when the parent needs to focus the input programmatically. */
  id?: string;
}

/**
 * Tight wrapper around `Field` + `NumberStepper`. Used heavily across the
 * assessment form (one cell per metric) so we only need to spell out the
 * numerics here and the cell layout stays uniform.
 */
export function MetricNumberField({
  label,
  value,
  onChange,
  unit,
  precision = 1,
  min,
  max,
  hint,
  required,
  disabled,
  id,
}: MetricNumberFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <Field
      label={label}
      hint={hint}
      required={required}
      htmlFor={fieldId}
    >
      <NumberStepper
        id={fieldId}
        value={value}
        onChange={onChange}
        precision={precision}
        step={precision > 0 ? 1 / 10 ** Math.min(precision, 1) : 1}
        min={min}
        max={max}
        suffix={unit}
        disabled={disabled}
        className="w-full"
      />
    </Field>
  );
}
