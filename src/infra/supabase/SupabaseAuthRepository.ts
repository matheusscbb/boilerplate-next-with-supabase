import type { IAuthRepository, AuthCredentials } from '@/core/contracts';
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

  async signUp({ email, password }: AuthCredentials) {
    const { error } = await this.client.auth.signUp({ email, password });
    return { error: error ?? null };
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    return { error: error ?? null };
  }
}
