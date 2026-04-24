'use client';

import { Input } from '@/design-system';

export interface DayNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Inline, borderless text input for the day name (renders inside the header). */
export function DayNameField({
  value,
  onChange,
  placeholder = 'Nome do dia (ex: Peito e Tríceps)',
}: DayNameFieldProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 border-0 bg-transparent px-0 py-0 text-sm font-medium focus:ring-0 h-auto"
    />
  );
}
