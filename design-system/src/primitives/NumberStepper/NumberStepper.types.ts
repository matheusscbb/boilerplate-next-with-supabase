import type { Ref } from 'react';

export interface NumberStepperProps {
  ref?: Ref<HTMLInputElement>;
  /** Valor atual; `null` significa "vazio". */
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Casas decimais preservadas ao renderizar o valor. */
  precision?: number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  /** Sufixo textual opcional (ex.: "kg", "reps"). */
  suffix?: string;
  size?: 'sm' | 'md';
  id?: string;
  name?: string;
  'aria-label'?: string;
  className?: string;
}
