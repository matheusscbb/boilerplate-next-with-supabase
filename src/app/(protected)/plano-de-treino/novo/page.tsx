import Link from 'next/link';
import { PlanForm } from '@/features/training-plans';

export default function NovoPlanPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      {/* Breadcrumb / back */}
      <div className="mb-6">
        <Link
          href="/plano-de-treino"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Planos de Treino
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Novo Plano de Treino
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina a programação, os dias e os exercícios do plano.
        </p>
      </div>

      <PlanForm />
    </div>
  );
}
