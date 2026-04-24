'use client';

import { useActionState, useState } from 'react';
import { Button, Input, Card } from '@/design-system';
import type { UserRole } from '@/core/domain';
import { updateProfileName } from '@/app/(protected)/perfil/actions';

interface ProfileCardProps {
  fullName: string | null;
  email: string;
  role: UserRole | null;
  createdAt: string;
}

const initialState = { error: null as string | null, success: false };

export function ProfileCard({ fullName, email, role, createdAt }: ProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (prev: typeof initialState, formData: FormData) => {
      const result = await updateProfileName(prev, formData);
      if (result.success) setEditing(false);
      return result;
    },
    initialState
  );

  return (
    <Card>
      <form action={formAction}>
        {/* Header with action buttons */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg font-semibold">Conta</span>
          {editing ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" isLoading={isPending}>
                Salvar
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
            >
              Editar
            </Button>
          )}
        </div>

        {/* Fields */}
        <Card.Content>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Nome — editável */}
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nome
              </dt>
              <dd className="mt-1">
                {editing ? (
                  <Input
                    name="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    defaultValue={fullName ?? ''}
                    required
                    autoFocus
                  />
                ) : (
                  <span className="text-sm text-foreground">{fullName ?? '—'}</span>
                )}
              </dd>
            </div>

            {/* Email — somente leitura */}
            <Field label="Email" value={email} />

            {/* Papel — somente leitura */}
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Papel
              </dt>
              <dd className="mt-1">
                <RoleBadge role={role} />
              </dd>
            </div>

            {/* Data de criação — somente leitura */}
            <Field label="Conta criada em" value={createdAt} />
          </dl>

          {state.error && (
            <p className="mt-3 text-sm text-destructive">{state.error}</p>
          )}
        </Card.Content>
      </form>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole | null }) {
  if (!role) {
    return (
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        Sem papel
      </span>
    );
  }
  const isTrainer = role === 'trainer';
  return (
    <span
      className={[
        'rounded-full px-2.5 py-0.5 text-xs font-medium',
        isTrainer ? 'bg-primary/15 text-primary' : 'bg-success/15 text-success',
      ].join(' ')}
    >
      {isTrainer ? 'Coach' : 'Aluno'}
    </span>
  );
}
