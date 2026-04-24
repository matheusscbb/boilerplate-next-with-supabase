import { createClient } from '@/infra/supabase/server';
import {
  InviteButton,
  PendingInvitesList,
  listMyActiveInvites,
  StudentsList,
  listMyPlans,
  listMyStudents,
} from '@/features/students';

export const dynamic = 'force-dynamic';

export default async function AlunosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Only trainers should reach this page; however we don't hard-block other
  // roles at the route level because the queries below return empty for them
  // (no profile has them as coach_id). The nav entry is already gated.
  const [students, plans, activeInvites] = await Promise.all([
    listMyStudents(supabase, user.id),
    listMyPlans(supabase, user.id),
    listMyActiveInvites(supabase, user.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meus Alunos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Convide alunos, atribua planos e acompanhe a evolução.
          </p>
        </div>
        <InviteButton />
      </div>

      <PendingInvitesList invites={activeInvites} />
      <StudentsList students={students} plans={plans} />
    </div>
  );
}
