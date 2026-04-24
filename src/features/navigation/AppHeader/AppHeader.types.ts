import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/core/domain';

export interface AppHeaderProps {
  user: User;
  /** Role from the `profiles` table; `null` while unknown (degrades safely). */
  role: UserRole | null;
}
