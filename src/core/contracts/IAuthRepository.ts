import type { Session, User } from '@supabase/supabase-js';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpOptions {
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
