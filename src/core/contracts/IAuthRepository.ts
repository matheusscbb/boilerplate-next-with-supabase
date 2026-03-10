import type { User } from '@supabase/supabase-js';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface IAuthRepository {
  getCurrentUser(): Promise<User | null>;
  signIn(credentials: AuthCredentials): Promise<{ error: Error | null }>;
  signUp(credentials: AuthCredentials): Promise<{ error: Error | null }>;
  signOut(): Promise<{ error: Error | null }>;
}
