import type { TextareaHTMLAttributes, Ref } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
  error?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}
