'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Dialog, Select, Stack } from '@/design-system';
import { assignPlan, unassignPlan } from '@/features/students/actions';

export interface PlanStudentRow {
  assignmentId: string;
  studentId: string;
  studentName: string | null;
  isActive: boolean;
}

export interface AvailableStudent {
  id: string;
  full_name: string | null;
}

export interface PlanStudentsManagerProps {
  planId: string;
  assignedStudents: PlanStudentRow[];
  availableStudents: AvailableStudent[];
}

export function PlanStudentsManager({
  planId,
  assignedStudents: initialAssigned,
  availableStudents: initialAvailable,
}: PlanStudentsManagerProps) {
  const router = useRouter();

  const [assigned, setAssigned] = useState(initialAssigned);
  const [available, setAvailable] = useState(initialAvailable);

  useEffect(() => {
    setAssigned(initialAssigned);
  }, [initialAssigned]);

  useEffect(() => {
    setAvailable(initialAvailable);
  }, [initialAvailable]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);

  // Students not yet assigned to this plan
  const unassigned = available.filter(
    (s) => !assigned.some((a) => a.studentId === s.id)
  );

  const handleOpenDialog = () => {
    setSelectedStudentId('');
    setAssignError(null);
    setDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedStudentId) {
      setAssignError('Selecione um aluno.');
      return;
    }
    setAssigning(true);
    setAssignError(null);
    try {
      await assignPlan({ studentId: selectedStudentId, planId });
      setDialogOpen(false);
      router.refresh();
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Falha ao atribuir aluno.');
      setAssigning(false);
    }
  };

  const handleUnassign = async (row: PlanStudentRow) => {
    if (
      !window.confirm(
        `Remover ${row.studentName ?? 'este aluno'} deste plano? O histórico de treinos dele será mantido.`
      )
    ) {
      return;
    }
    setRemovingId(row.studentId);
    try {
      await unassignPlan({ studentId: row.studentId, planId });
      router.refresh();
    } catch (err) {
      console.error('[PlanStudentsManager] unassign failed', err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Alunos neste plano</h2>
          <p className="text-xs text-muted-foreground">
            Gerencie quais alunos têm este plano ativo.
          </p>
        </div>

        {unassigned.length > 0 && (
          <Button type="button" size="sm" variant="secondary" onClick={handleOpenDialog}>
            + Atribuir aluno
          </Button>
        )}
      </div>

      {assigned.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum aluno atribuído a este plano ainda.
          </p>
          {unassigned.length > 0 && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mt-2"
              onClick={handleOpenDialog}
            >
              Atribuir primeiro aluno
            </Button>
          )}
          {unassigned.length === 0 && available.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Todos os seus alunos já estão atribuídos a este plano.
            </p>
          )}
          {available.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Você ainda não tem alunos. Convide alunos pela página de Alunos.
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {assigned.map((row) => (
            <li
              key={row.assignmentId}
              className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {(row.studentName ?? '?').charAt(0).toUpperCase()}
              </span>

              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {row.studentName ?? 'Aluno sem nome'}
              </span>

              {row.isActive ? (
                <Badge variant="success" size="sm">
                  Ativo
                </Badge>
              ) : (
                <Badge variant="default" size="sm">
                  Inativo
                </Badge>
              )}

              <Button
                type="button"
                size="sm"
                variant="ghost"
                isLoading={removingId === row.studentId}
                onClick={() => handleUnassign(row)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                Remover
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Show "Atribuir aluno" button below list when there are students assigned and more available */}
      {assigned.length > 0 && unassigned.length > 0 && (
        <div className="mt-3">
          <Button type="button" size="sm" variant="ghost" onClick={handleOpenDialog}>
            + Atribuir outro aluno
          </Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} size="sm">
        <Dialog.Header>Atribuir aluno a este plano</Dialog.Header>
        <Dialog.Body>
          <Stack gap="md">
            <p className="text-sm text-muted-foreground">
              O plano atual do aluno será desativado automaticamente e este passará a ser o ativo.
            </p>

            <div>
              <label
                htmlFor="student-select"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Aluno
              </label>
              <Select
                id="student-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">Selecione um aluno…</option>
                {unassigned.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name ?? s.id}
                  </option>
                ))}
              </Select>
            </div>

            {assignError && <p className="text-sm text-destructive">{assignError}</p>}
          </Stack>
        </Dialog.Body>
        <Dialog.Footer>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              disabled={assigning}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAssign}
              isLoading={assigning}
            >
              Atribuir
            </Button>
          </div>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}
