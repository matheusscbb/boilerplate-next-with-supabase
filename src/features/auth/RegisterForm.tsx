'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/infra/supabase/client';
import { SupabaseAuthRepository } from '@/infra/supabase/SupabaseAuthRepository';
import { Button, Input, Card, Stack } from '@/design-system';

const authRepo = new SupabaseAuthRepository();

export interface RegisterFormProps {
  /**
   * When present, the form forces role=student and runs accept_coach_invite
   * right after signup so the new student is linked to the coach.
   */
  inviteToken?: string;
  /**
   * When present, the form forces role=trainer and runs consume_trainer_invite
   * right after signup so the new trainer account is properly set up.
   */
  trainerInviteToken?: string;
}

export function RegisterForm({ inviteToken, trainerInviteToken }: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isTrainerInvite = Boolean(trainerInviteToken);
  const isCoachInvite = Boolean(inviteToken);
  const hasInvite = isTrainerInvite || isCoachInvite;

  const effectiveRole = isTrainerInvite ? 'trainer' : 'student';

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

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    const { error: signUpError, session } = await authRepo.signUp(
      { email, password },
      { role: effectiveRole, fullName: fullName.trim() }
    );

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    const supabase = createClient();

    if (isTrainerInvite && trainerInviteToken) {
      if (session?.user) {
        const { error: rpcError } = await supabase.rpc('consume_trainer_invite', {
          p_token: trainerInviteToken,
        });
        if (rpcError) {
          console.error('[RegisterForm] trainer invite consumption failed:', rpcError);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('pending_trainer_invite_token', trainerInviteToken);
          }
        }
      } else if (typeof window !== 'undefined') {
        window.localStorage.setItem('pending_trainer_invite_token', trainerInviteToken);
      }
    }

    if (isCoachInvite && inviteToken) {
      if (session?.user) {
        const { error: rpcError } = await supabase.rpc('accept_coach_invite', {
          p_token: inviteToken,
        });
        if (rpcError) {
          console.error('[RegisterForm] coach invite acceptance failed:', rpcError);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('pending_invite_token', inviteToken);
          }
        }
      } else if (typeof window !== 'undefined') {
        window.localStorage.setItem('pending_invite_token', inviteToken);
      }
    }

    setLoading(false);
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
        <Card.Header>
          {isTrainerInvite
            ? 'Cadastro de Treinador'
            : isCoachInvite
              ? 'Aceitar convite do coach'
              : 'Criar conta'}
        </Card.Header>
        <Card.Content>
          <Stack gap="md">
            {hasInvite && (
              <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                {isTrainerInvite
                  ? 'Você foi convidado como treinador. Ao finalizar o cadastro, sua conta terá acesso às funcionalidades de treinador.'
                  : 'Você foi convidado por um coach. Ao finalizar o cadastro, sua conta será vinculada automaticamente.'}
              </p>
            )}

            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-foreground">
                Nome completo <span className="text-destructive">*</span>
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
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
