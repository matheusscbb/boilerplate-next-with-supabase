import type { SelectHTMLAttributes, Ref } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
  error?: string;
}
