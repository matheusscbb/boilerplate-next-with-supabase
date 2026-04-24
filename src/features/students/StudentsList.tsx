import type { StudentSummary } from './types';
import { StudentCard } from './StudentCard';
import type { AssignablePlan } from './types';

export interface StudentsListProps {
  students: StudentSummary[];
  plans: AssignablePlan[];
}

/**
 * Server component: shows each coached student as a card with an Assign Plan
 * action. Rendering is server-side; the interactive parts live in StudentCard.
 */
export function StudentsList({ students, plans }: StudentsListProps) {
  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <p className="text-sm font-medium text-foreground">
          Nenhum aluno ainda.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Gere um convite para começar a montar seu time.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {students.map((student) => (
        <li key={student.id}>
          <StudentCard student={student} plans={plans} />
        </li>
      ))}
    </ul>
  );
}
