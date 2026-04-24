'use client';

import { useState } from 'react';
import { Button, Dialog, Stack } from '@/design-system';
import { createTrainerInvite } from './actions';

interface GenerateTrainerInviteDialogProps {
  trigger?: React.ReactNode;
}

export function GenerateTrainerInviteDialog({ trigger }: GenerateTrainerInviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; expires_at: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await createTrainerInvite();
      setResult({ url: data.url, expires_at: data.expires_at });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar convite.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const expiresFormatted = result
    ? new Date(result.expires_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
        className="contents"
      >
        {trigger ?? (
          <Button size="sm" variant="secondary">
            Gerar convite de treinador
          </Button>
        )}
      </span>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <Dialog.Header>
          Convite para Treinador
        </Dialog.Header>

        <Dialog.Body>
          <Stack gap="md">
            <p className="text-sm text-muted-foreground">
              Gere um link único para convidar um novo treinador. O link expira em 7 dias.
            </p>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {!result && (
              <Button onClick={handleGenerate} isLoading={loading} fullWidth>
                Gerar link de convite
              </Button>
            )}

            {result && (
              <Stack gap="sm">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Link de cadastro
                  </p>
                  <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                    <p className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                      {result.url}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="shrink-0 rounded px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expira em: {expiresFormatted}
                </p>
                <Button variant="secondary" size="sm" onClick={handleGenerate} isLoading={loading}>
                  Gerar novo link
                </Button>
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
