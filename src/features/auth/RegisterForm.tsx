'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SupabaseAuthRepository } from '@/infra/supabase/SupabaseAuthRepository';
import { Button, Input, Card, Stack } from '@/design-system';

const authRepo = new SupabaseAuthRepository();

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await authRepo.signUp({ email, password });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <Card>
        <Card.Content>
          <Stack gap="md">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">Conta criada!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Verifique seu e-mail para confirmar o cadastro antes de fazer login.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Ir para o login
            </Link>
          </Stack>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Card.Header>Criar conta</Card.Header>
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-foreground">
                Confirmar senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              Criar conta
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Entrar
              </Link>
            </p>
          </Stack>
        </Card.Footer>
      </form>
    </Card>
  );
}
