'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/design-system';
import { toggleUserActive } from './actions';
import { GenerateTrainerInviteDialog } from './GenerateTrainerInviteDialog';
import type { TrainerRow } from './types';

interface TrainersTableProps {
  trainers: TrainerRow[];
}

export function TrainersTable({ trainers }: TrainersTableProps) {
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useState<Record<string, boolean>>({});

  const filtered = trainers.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.full_name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q)
    );
  });

  const handleToggleActive = (trainer: TrainerRow) => {
    const newValue = !trainer.is_active;
    setOptimisticState((prev) => ({ ...prev, [trainer.id]: newValue }));
    startTransition(async () => {
      try {
        await toggleUserActive(trainer.id, newValue);
      } catch {
        setOptimisticState((prev) => ({ ...prev, [trainer.id]: trainer.is_active }));
      }
    });
  };

  const isActive = (trainer: TrainerRow) =>
    optimisticState[trainer.id] ?? trainer.is_active;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Buscar treinador por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <GenerateTrainerInviteDialog />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/20 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? 'Nenhum treinador encontrado.' : 'Nenhum treinador cadastrado ainda.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Alunos
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((trainer) => {
                const active = isActive(trainer);
                return (
                  <tr
                    key={trainer.id}
                    className="bg-background transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {trainer.full_name ?? '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(trainer.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {trainer.student_count}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={active ? 'success' : 'danger'}>
                        {active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <GenerateTrainerInviteDialog
                          trigger={
                            <button
                              type="button"
                              className="rounded px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                            >
                              Gerar convite
                            </button>
                          }
                        />
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleToggleActive(trainer)}
                          className={`rounded px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                            active
                              ? 'text-destructive hover:bg-destructive/10'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                          }`}
                        >
                          {active ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
