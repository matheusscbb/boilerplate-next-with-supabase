'use client';

import { useEffect, useState } from 'react';
import { Button, Dialog, Input, Stack } from '@/design-system';
import { createInvite, type CreateInviteResult } from './actions';

export interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Two-step flow:
 *   1. Coach clicks "Gerar link" → RPC creates an invite row.
 *   2. We display the ready-to-share URL with a Copy button.
 */
export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const [invite, setInvite] = useState<CreateInviteResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setInvite(null);
      setCopied(false);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await createInvite();
      setInvite(result);
    } catch (err) {
      console.error('[InviteDialog]', err);
      setError(err instanceof Error ? err.message : 'Falha ao gerar o convite.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[InviteDialog] clipboard failed:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="sm">
      <Dialog.Header>Convidar aluno</Dialog.Header>
      <Dialog.Body>
        <Stack gap="md">
          {!invite ? (
            <p className="text-sm text-muted-foreground">
              Gere um link de convite para compartilhar com seu novo aluno. Ao
              se cadastrar, ele será vinculado automaticamente à sua lista.
              O link expira em 7 dias.
            </p>
          ) : (
            <>
              <p className="text-sm text-foreground">
                Compartilhe este link com o aluno:
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={invite.url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={handleCopy}>
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Expira em{' '}
                {new Date(invite.expires_at).toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
                .
              </p>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </Stack>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          {!invite && (
            <Button type="button" onClick={handleGenerate} isLoading={loading}>
              Gerar link
            </Button>
          )}
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
