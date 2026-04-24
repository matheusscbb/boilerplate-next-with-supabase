'use client';

import { useState } from 'react';
import { Button } from '@/design-system';
import { AssignPlanDialog } from './AssignPlanDialog';
import type { AssignablePlan, StudentSummary } from './types';

export interface StudentCardProps {
  student: StudentSummary;
  plans: AssignablePlan[];
}

export function StudentCard({ student, plans }: StudentCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const displayName = student.full_name?.trim() || 'Aluno sem nome';
  const initials = buildInitials(displayName);

  return (
    <>
      <article className="flex h-full flex-col rounded-xl border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
        <header className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {student.active_plan_name
                ? `Plano ativo: ${student.active_plan_name}`
                : 'Sem plano ativo'}
            </p>
          </div>
        </header>

        <footer className="mt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => setDialogOpen(true)}
          >
            Atribuir plano
          </Button>
        </footer>
      </article>

      <AssignPlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={student}
        plans={plans}
      />
    </>
  );
}

function buildInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
