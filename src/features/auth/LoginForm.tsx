'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/infra/supabase/client';
import { SupabaseAuthRepository } from '@/infra/supabase/SupabaseAuthRepository';
import { Button, Input, Card, Stack } from '@/design-system';

const authRepo = new SupabaseAuthRepository();
const PENDING_INVITE_KEY = 'pending_invite_token';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await authRepo.signIn({ email, password });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    // Redeem a pending invite token (persisted on signup when email
    // confirmation prevented immediate session creation).
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem(PENDING_INVITE_KEY);
      if (token) {
        const supabase = createClient();
        const { error: rpcError } = await supabase.rpc('accept_coach_invite', {
          p_token: token,
        });
        if (rpcError) {
          console.error('[LoginForm] pending invite RPC failed:', rpcError);
          // Keep token so the user can retry after fixing the issue (e.g. new invite).
        } else {
          window.localStorage.removeItem(PENDING_INVITE_KEY);
        }
      }
    }

    setLoading(false);
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Card.Header>Entrar</Card.Header>
        <Card.Content>
          <Stack gap="md">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </Stack>
        </Card.Content>
        <Card.Footer>
          <Stack gap="sm">
            <Button type="submit" isLoading={loading} fullWidth>
              Entrar
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                Criar conta
              </Link>
            </p>
          </Stack>
        </Card.Footer>
      </form>
    </Card>
  );
}
