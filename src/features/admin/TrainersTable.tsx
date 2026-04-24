'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/design-system';
import { toggleUserActive, updateTrainerLicense } from './actions';
import { GenerateTrainerInviteDialog } from './GenerateTrainerInviteDialog';
import type { TrainerRow } from './types';

interface TrainersTableProps {
  trainers: TrainerRow[];
}

function LicenseCell({
  trainerId,
  value,
  isPending,
}: {
  trainerId: string;
  value: string | null;
  isPending: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(
    value ? value.slice(0, 10) : '' // YYYY-MM-DD
  );
  const [saving, setSaving] = useState(false);

  const isExpired = value !== null && new Date(value) < new Date();

  const handleSave = async () => {
    setSaving(true);
    try {
      const isoValue = inputValue ? new Date(inputValue).toISOString() : null;
      await updateTrainerLicense(trainerId, isoValue);
    } catch {
      // silently restore
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="rounded border border-border bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded px-1.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
        >
          {saving ? '…' : 'OK'}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => !isPending && setEditing(true)}
      disabled={isPending}
      title="Clique para editar"
      className="group flex items-center gap-1 text-left disabled:opacity-50"
    >
      {value ? (
        <span
          className={`text-sm ${
            isExpired ? 'font-medium text-destructive' : 'text-foreground'
          }`}
        >
          {new Date(value).toLocaleDateString('pt-BR')}
          {isExpired && (
            <span className="ml-1 text-xs text-destructive">(expirada)</span>
          )}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
      <span className="opacity-0 text-xs text-muted-foreground group-hover:opacity-100">
        ✏
      </span>
    </button>
  );
}

export function TrainersTable({ trainers }: TrainersTableProps) {
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useState<Record<string, boolean>>({});

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
    setOptimisticActive((prev) => ({ ...prev, [trainer.id]: newValue }));
    startTransition(async () => {
      try {
        await toggleUserActive(trainer.id, newValue);
      } catch {
        setOptimisticActive((prev) => ({ ...prev, [trainer.id]: trainer.is_active }));
      }
    });
  };

  const isActive = (trainer: TrainerRow) =>
    optimisticActive[trainer.id] ?? trainer.is_active;

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
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Alunos
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                  Licença expira em
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
                        Desde {new Date(trainer.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {trainer.student_count}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <LicenseCell
                        trainerId={trainer.id}
                        value={trainer.license_expires_at}
                        isPending={isPending}
                      />
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
                              Convites
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
