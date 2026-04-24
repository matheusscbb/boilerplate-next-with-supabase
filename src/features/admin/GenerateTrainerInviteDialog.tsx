'use client';

import { useState } from 'react';
import { Button, Dialog, Stack } from '@/design-system';
import { createTrainerInvite, listActiveTrainerInvites } from './actions';
import type { TrainerInviteSummary } from './types';

interface GenerateTrainerInviteDialogProps {
  trigger?: React.ReactNode;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function InviteRow({ invite }: { invite: TrainerInviteSummary }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(invite.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs text-foreground">{invite.url}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Gerado em {fmtDate(invite.created_at)} · Expira em {fmtDate(invite.expires_at)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}

export function GenerateTrainerInviteDialog({ trigger }: GenerateTrainerInviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [invites, setInvites] = useState<TrainerInviteSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    setError(null);
    try {
      const data = await listActiveTrainerInvites();
      setInvites(data);
    } catch {
      setError('Erro ao carregar convites.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const newInvite = await createTrainerInvite();
      setInvites((prev) => [newInvite, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar convite.');
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setInvites([]);
    setError(null);
  };

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
        className="contents"
      >
        {trigger ?? (
          <Button size="sm" variant="secondary">
            Gerar convite de treinador
          </Button>
        )}
      </span>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }} size="lg">
        <Dialog.Header>
          Convites para Treinador
        </Dialog.Header>

        <Dialog.Body>
          <Stack gap="md">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Links válidos (não utilizados e dentro do prazo de 7 dias).
              </p>
              <Button size="sm" onClick={handleGenerate} isLoading={generating}>
                + Novo convite
              </Button>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : invites.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum convite ativo. Clique em &quot;+ Novo convite&quot; para gerar um.
                </p>
              </div>
            ) : (
              <Stack gap="sm">
                {invites.map((invite) => (
                  <InviteRow key={invite.id} invite={invite} />
                ))}
              </Stack>
            )}
          </Stack>
        </Dialog.Body>

        <Dialog.Footer>
          <Button variant="ghost" onClick={handleClose}>
            Fechar
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}
