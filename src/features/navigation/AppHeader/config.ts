import type { ComponentType } from 'react';
import type { UserRole } from '@/core/domain';
import { CalendarIcon, DumbbellIcon, SaladIcon, UsersIcon } from './icons';

export interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType;
  /**
   * When set, the item is rendered only when the user's role matches. Omit to
   * keep the item visible for every authenticated user.
   */
  requiresRole?: UserRole;
}

const ALL_ITEMS: readonly NavItem[] = [
  { href: '/treinos', label: 'Treinos', Icon: DumbbellIcon },
  { href: '/plano-de-treino', label: 'Plano de Treino', Icon: CalendarIcon, requiresRole: 'trainer' },
  { href: '/alunos', label: 'Alunos', Icon: UsersIcon, requiresRole: 'trainer' },
  { href: '/dieta', label: 'Dieta', Icon: SaladIcon },
] as const;

/** Filter the nav items for the given user role. */
export function getNavItems(role: UserRole | null): readonly NavItem[] {
  return ALL_ITEMS.filter(
    (item) => !item.requiresRole || item.requiresRole === role
  );
}
