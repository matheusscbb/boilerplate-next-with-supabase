import { redirect } from 'next/navigation';
import { createClient } from '@/infra/supabase/server';
import { PendingCoachInviteRedeem } from '@/features/auth';
import { AppHeader } from '@/features/navigation';
import type { UserRole } from '@/core/domain';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Role drives which nav items render (e.g. /alunos is trainer-only).
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  const role: UserRole | null = (profile?.role as UserRole | undefined) ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="print:hidden">
        <PendingCoachInviteRedeem />
        <AppHeader user={user} role={role} />
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
}
