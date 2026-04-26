import type { ReactNode } from 'react';

export interface FieldProps {
  /** Visual label rendered above the input. */
  label?: ReactNode;
  /** Helper / contextual hint shown below the input when there is no error. */
  hint?: ReactNode;
  /** Error text shown in destructive color in place of `hint`. */
  error?: ReactNode;
  /** Marks the field as required (renders a destructive asterisk). */
  required?: boolean;
  /** Forwarded as `htmlFor` of the label so screen readers pair them. */
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}
