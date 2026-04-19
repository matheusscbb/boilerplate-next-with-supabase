import type { InputHTMLAttributes, Ref } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  ref?: Ref<HTMLInputElement>;
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}
