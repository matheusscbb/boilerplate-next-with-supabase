'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Stack } from '@/design-system';
import { createClient } from '@/infra/supabase/client';
import { assignPlan, unassignPlan } from '@/features/students/actions';

export interface ApplyPlanToSelfProps {
  planId: string;
  /** When true, this plan is already the signed-in user's active assignment. */
  isActiveForMe: boolean;
}

export function ApplyPlanToSelf({ planId, isActiveForMe: initialActive }: ApplyPlanToSelfProps) {
  const router = useRouter();
  const [isActiveForMe, setIsActiveForMe] = useState(initialActive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsActiveForMe(initialActive);
  }, [initialActive]);

  const run = async (fn: (userId: string) => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error('Sessão inválida. Entre novamente.');
      await fn(user.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () =>
    run(async (userId) => {
      await assignPlan({ planId, studentId: userId });
      setIsActiveForMe(true);
    });

  const handleRemove = () => {
    if (
      !window.confirm(
        'Remover este plano dos seus treinos? Você poderá ativar outro plano depois.'
      )
    ) {
      return;
    }
    run(async (userId) => {
      await unassignPlan({ planId, studentId: userId });
      setIsActiveForMe(false);
    });
  };

  if (isActiveForMe) {
    return (
      <div className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3">
        <Stack gap="sm">
          <p className="text-sm font-medium text-foreground">
            Este plano está ativo para você em Treinos.
          </p>
          <p className="text-xs text-muted-foreground">
            Você continua como coach; esta atribuição só define qual plano aparece na página de
            treinos do dia.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/treinos">
              <Button size="sm" variant="primary">
                Abrir Treinos
              </Button>
            </Link>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              isLoading={loading}
              onClick={handleRemove}
            >
              Remover dos meus treinos
            </Button>
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </Stack>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-border bg-muted/40 px-4 py-3">
      <Stack gap="sm">
        <p className="text-sm font-medium text-foreground">Treinar com este plano</p>
        <p className="text-xs text-muted-foreground">
          Ative este plano para a sua própria conta: ele passa a ser o plano do dia em Treinos
          (sem precisar mudar seu perfil para aluno).
        </p>
        <div>
          <Button type="button" size="sm" variant="secondary" isLoading={loading} onClick={handleApply}>
            Usar este plano em mim
          </Button>
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </Stack>
    </div>
  );
}
