import type { ComponentType } from 'react';
import { CalendarIcon, DumbbellIcon, SaladIcon } from './icons';

export interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/treinos', label: 'Treinos', Icon: DumbbellIcon },
  { href: '/plano-de-treino', label: 'Plano de Treino', Icon: CalendarIcon },
  { href: '/dieta', label: 'Dieta', Icon: SaladIcon },
] as const;
