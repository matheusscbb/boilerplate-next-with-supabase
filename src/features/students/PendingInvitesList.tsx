'use client';

import { useState } from 'react';
import { Button } from '@/design-system';
import type { CoachInviteSummary } from './types';

export interface PendingInvitesListProps {
  invites: CoachInviteSummary[];
}

export function PendingInvitesList({ invites }: PendingInvitesListProps) {
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  const buildInviteUrl = (token: string) => `/register?invite=${token}`;

  const buildAbsoluteInviteUrl = (token: string) =>
    `${window.location.origin}/register?invite=${token}`;

  const handleCopy = async (inviteId: string, token: string) => {
    try {
      await navigator.clipboard.writeText(buildAbsoluteInviteUrl(token));
      setCopiedInviteId(inviteId);
      window.setTimeout(() => setCopiedInviteId((value) => (value === inviteId ? null : value)), 2000);
    } catch (error) {
      console.error('[PendingInvitesList] copy failed:', error);
    }
  };

  if (invites.length === 0) return null;

  return (
    <section className="mb-6 rounded-xl border border-border bg-background p-4 shadow-sm">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-foreground">
          Links de convite ativos
        </h2>
        <p className="text-xs text-muted-foreground">
          Convites pendentes aparecem aqui ate serem aceitos ou expirarem.
        </p>
      </header>

      <ul className="space-y-2">
        {invites.map((invite) => (
          <li
            key={invite.id}
            className="rounded-lg border border-border bg-muted/20 p-3"
          >
            <a
              href={buildInviteUrl(invite.token)}
              className="block truncate text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              {buildInviteUrl(invite.token)}
            </a>
            <p className="mt-1 text-xs text-muted-foreground">
              Expira em{' '}
              {new Date(invite.expires_at).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
              .
            </p>
            <div className="mt-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleCopy(invite.id, invite.token)}
              >
                {copiedInviteId === invite.id ? 'Copiado!' : 'Copiar link'}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
