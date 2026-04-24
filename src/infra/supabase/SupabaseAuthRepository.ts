import type {
  IAuthRepository,
  AuthCredentials,
  SignUpOptions,
} from '@/core/contracts';
import { createClient } from './client';

export class SupabaseAuthRepository implements IAuthRepository {
  private get client() {
    return createClient();
  }

  async getCurrentUser() {
    const { data: { user } } = await this.client.auth.getUser();
    return user ?? null;
  }

  async signIn({ email, password }: AuthCredentials) {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    return { error: error ?? null };
  }

  async signUp(
    { email, password }: AuthCredentials,
    options?: SignUpOptions
  ) {
    // role/full_name live in user_metadata so the handle_new_user trigger
    // can stamp them onto the freshly created profiles row.
    const metadata: Record<string, string> = {};
    if (options?.role) metadata.role = options.role;
    if (options?.fullName) metadata.full_name = options.fullName;

    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: Object.keys(metadata).length ? { data: metadata } : undefined,
    });
    return { error: error ?? null, session: data.session ?? null };
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    return { error: error ?? null };
  }
}
