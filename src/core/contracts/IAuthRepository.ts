import type { Session, User } from '@supabase/supabase-js';
import type { UserRole } from '@/core/domain';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpOptions {
  /** Initial profile role stamped into auth user_metadata. */
  role?: UserRole;
  /** Optional display name, also persisted in user_metadata. */
  fullName?: string;
}

export interface IAuthRepository {
  getCurrentUser(): Promise<User | null>;
  signIn(credentials: AuthCredentials): Promise<{ error: Error | null }>;
  signUp(
    credentials: AuthCredentials,
    options?: SignUpOptions
  ): Promise<{ error: Error | null; session: Session | null }>;
  signOut(): Promise<{ error: Error | null }>;
}
