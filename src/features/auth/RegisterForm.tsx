'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SupabaseAuthRepository } from '@/infra/supabase/SupabaseAuthRepository';
import { Button, Input, Card, Stack } from '@/design-system';

const authRepo = new SupabaseAuthRepository();

export function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('O nome é obrigatório.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    const { error: signUpError, session } = await authRepo.signUp(
      { email, password },
      { fullName: fullName.trim() }
    );

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    setLoading(false);

    // Quando a confirmação por email está habilitada o Supabase devolve
    // session=null; pedimos ao usuário para confirmar antes de seguir.
    if (!session) {
      setSuccess(true);
      return;
    }

    router.push('/');
    router.refresh();
  };

  if (success) {
    return (
      <Card>
        <Card.Header>Conta criada</Card.Header>
        <Card.Content>
          <p className="text-sm text-muted-foreground">
            Enviamos um email de confirmação para <strong>{email}</strong>. Confirme
            seu email e em seguida faça login.
          </p>
        </Card.Content>
        <Card.Footer>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
          >
            Ir para o login
          </Link>
        </Card.Footer>
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
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-foreground">
                Nome
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
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
                minLength={6}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
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
