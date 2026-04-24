'use client';

import { useState } from 'react';
import { Tabs } from '@/design-system';
import { TrainersTable } from './TrainersTable';
import { StudentsTable } from './StudentsTable';
import { GenerateTrainerInviteDialog } from './GenerateTrainerInviteDialog';
import type { AdminPanelProps } from './types';

export function AdminPanel({ trainers, students, allTrainers }: AdminPanelProps) {
  const [tab, setTab] = useState<'trainers' | 'students'>('trainers');

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administração</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie treinadores e alunos da plataforma.
          </p>
        </div>
        <GenerateTrainerInviteDialog />
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Treinadores
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{trainers.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Ativos
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {trainers.filter((t) => t.is_active).length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Alunos
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{students.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sem treinador
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {students.filter((s) => !s.coach_id).length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onChange={(v) => setTab(v as typeof tab)} aria-label="Seções do painel admin">
        <div className="mb-6">
          <Tabs.List>
            <Tabs.Trigger value="trainers">
              Treinadores ({trainers.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="students">
              Alunos ({students.length})
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        <Tabs.Panel value="trainers">
          <TrainersTable trainers={trainers} />
        </Tabs.Panel>

        <Tabs.Panel value="students">
          <StudentsTable students={students} allTrainers={allTrainers} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
