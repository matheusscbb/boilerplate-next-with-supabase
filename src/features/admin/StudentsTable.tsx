'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/design-system';
import { toggleUserActive, assignStudentToTrainer } from './actions';
import type { StudentRow, AdminPanelProps } from './types';

interface StudentsTableProps {
  students: StudentRow[];
  allTrainers: AdminPanelProps['allTrainers'];
}

export function StudentsTable({ students, allTrainers }: StudentsTableProps) {
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useState<Record<string, boolean>>({});
  const [optimisticCoach, setOptimisticCoach] = useState<Record<string, string | null>>({});

  const filtered = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.coach_name?.toLowerCase().includes(q)
    );
  });

  const isActive = (s: StudentRow) => optimisticActive[s.id] ?? s.is_active;
  const coachId = (s: StudentRow) =>
    s.id in optimisticCoach ? optimisticCoach[s.id] : s.coach_id;

  const handleToggleActive = (student: StudentRow) => {
    const newValue = !student.is_active;
    setOptimisticActive((prev) => ({ ...prev, [student.id]: newValue }));
    startTransition(async () => {
      try {
        await toggleUserActive(student.id, newValue);
      } catch {
        setOptimisticActive((prev) => ({ ...prev, [student.id]: student.is_active }));
      }
    });
  };

  const handleAssignTrainer = (student: StudentRow, trainerId: string | null) => {
    setOptimisticCoach((prev) => ({ ...prev, [student.id]: trainerId }));
    startTransition(async () => {
      try {
        await assignStudentToTrainer(student.id, trainerId);
      } catch {
        setOptimisticCoach((prev) => ({ ...prev, [student.id]: student.coach_id }));
      }
    });
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="search"
          placeholder="Buscar aluno por nome ou treinador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/20 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? 'Nenhum aluno encontrado.' : 'Nenhum aluno cadastrado ainda.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Treinador
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((student) => {
                const active = isActive(student);
                const currentCoachId = coachId(student);
                return (
                  <tr
                    key={student.id}
                    className="bg-background transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {student.full_name ?? '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(student.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <select
                        value={currentCoachId ?? ''}
                        disabled={isPending}
                        onChange={(e) =>
                          handleAssignTrainer(student, e.target.value || null)
                        }
                        className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      >
                        <option value="">Sem treinador</option>
                        {allTrainers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.full_name ?? t.id}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={active ? 'success' : 'danger'}>
                        {active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleToggleActive(student)}
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
