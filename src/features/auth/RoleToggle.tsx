'use client';

import type { UserRole } from '@/core/domain';

export interface RoleToggleProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

interface RoleOption {
  value: UserRole;
  title: string;
  description: string;
}

const OPTIONS: ReadonlyArray<RoleOption> = [
  {
    value: 'trainer',
    title: 'Sou coach',
    description: 'Crio planos e gerencio alunos',
  },
  {
    value: 'student',
    title: 'Sou aluno',
    description: 'Sigo um plano do meu coach',
  },
];

/**
 * Pair of radio-style cards shown on signup when no invite token is present.
 * Picking "coach" promotes the user to `trainer` role on the profile row.
 */
export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">
        Você é coach ou aluno?
      </p>
      <div className="grid grid-cols-2 gap-2" role="radiogroup">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={[
                'rounded-md border px-3 py-2.5 text-left transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-background hover:border-foreground/20',
              ].join(' ')}
            >
              <span
                className={[
                  'block text-sm font-semibold',
                  selected ? 'text-primary' : 'text-foreground',
                ].join(' ')}
              >
                {opt.title}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
