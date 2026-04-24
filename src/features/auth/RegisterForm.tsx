'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/infra/supabase/client';
import { SupabaseAuthRepository } from '@/infra/supabase/SupabaseAuthRepository';
import { Button, Input, Card, Stack } from '@/design-system';
import { RoleToggle } from './RoleToggle';
import type { UserRole } from '@/core/domain';

const authRepo = new SupabaseAuthRepository();

export interface RegisterFormProps {
  /**
   * When present, the form hides the coach/student toggle, forces role=student,
   * and runs the accept_coach_invite RPC right after signup so the new student
   * is linked to the coach that generated the token.
   */
  inviteToken?: string;
}

export function RegisterForm({ inviteToken }: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(inviteToken ? 'student' : 'trainer');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (inviteToken && !fullName.trim()) {
      setError('O nome é obrigatório para aceitar o convite.');
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
    const effectiveRole: UserRole = inviteToken ? 'student' : role;
    const { error: signUpError, session } = await authRepo.signUp(
      { email, password },
      { role: effectiveRole, fullName: fullName.trim() || undefined }
    );

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // Invite consumption needs a JWT (session). Prefer the session returned by
    // signUp — getUser() right after can still be empty while cookies settle.
    // When email confirmation is ON there is no session yet; persist token
    // for redemption on first login (LoginForm + protected layout).
    if (inviteToken) {
      const supabase = createClient();
      if (session?.user) {
        const { error: rpcError } = await supabase.rpc('accept_coach_invite', {
          p_token: inviteToken,
        });
        if (rpcError) {
          console.error('[RegisterForm] invite acceptance failed:', rpcError);
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
          {inviteToken ? 'Aceitar convite do coach' : 'Criar conta'}
        </Card.Header>
        <Card.Content>
          <Stack gap="md">
            {!inviteToken && (
              <RoleToggle value={role} onChange={setRole} />
            )}

            {inviteToken && (
              <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Você foi convidado por um coach. Ao finalizar o cadastro, sua
                conta será vinculada automaticamente.
              </p>
            )}

            {inviteToken && (
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
            )}

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
