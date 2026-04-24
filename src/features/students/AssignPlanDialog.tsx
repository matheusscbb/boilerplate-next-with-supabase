'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Dialog, Select, Stack } from '@/design-system';
import { assignPlan } from './actions';
import type { AssignablePlan, StudentSummary } from './types';

export interface AssignPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentSummary;
  plans: AssignablePlan[];
}

export function AssignPlanDialog({
  open,
  onOpenChange,
  student,
  plans,
}: AssignPlanDialogProps) {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedPlanId('');
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!selectedPlanId) {
      setError('Selecione um plano.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await assignPlan({ studentId: student.id, planId: selectedPlanId });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error('[AssignPlanDialog]', err);
      setError(err instanceof Error ? err.message : 'Falha ao atribuir plano.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="sm">
      <Dialog.Header>Atribuir plano</Dialog.Header>
      <Dialog.Body>
        <Stack gap="md">
          <p className="text-sm text-muted-foreground">
            Escolha um plano para{' '}
            <span className="font-medium text-foreground">
              {student.full_name ?? 'este aluno'}
            </span>
            . O plano anterior será desativado automaticamente.
          </p>

          {plans.length === 0 ? (
            <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Você ainda não tem planos criados. Crie um plano primeiro em
              &quot;Plano de Treino&quot;.
            </p>
          ) : (
            <div>
              <label
                htmlFor="plan-select"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Plano
              </label>
              <Select
                id="plan-select"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
              >
                <option value="">Selecione…</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </Select>
            </div>
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
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            isLoading={loading}
            disabled={plans.length === 0}
          >
            Atribuir
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
