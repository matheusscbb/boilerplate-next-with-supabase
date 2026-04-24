import { redirect } from 'next/navigation';
import { createClient } from '@/infra/supabase/server';
import { AdminPanel } from '@/features/admin';
import { listAllTrainers, listAllStudents } from '@/features/admin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const [trainers, students] = await Promise.all([
    listAllTrainers(supabase),
    listAllStudents(supabase),
  ]);

  const allTrainers = trainers.map((t) => ({ id: t.id, full_name: t.full_name }));

  return (
    <AdminPanel
      trainers={trainers}
      students={students}
      allTrainers={allTrainers}
    />
  );
}
