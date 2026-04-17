import { redirect } from 'next/navigation';
import { createClient } from '@/infra/supabase/server';
import { LogoutButton } from '@/features/auth';
import { Card, CardHeader, CardContent, CardFooter, Stack } from '@/design-system';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Stack gap="lg">
          <h1 className="text-center text-2xl font-bold text-foreground">Dashboard</h1>
          <Card>
            <CardHeader>Informações do usuário</CardHeader>
            <CardContent>
              <Stack gap="sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">ID</p>
                  <p className="mt-1 font-mono text-sm text-foreground break-all">{user.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                  <p className="mt-1 text-sm text-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Conta criada em</p>
                  <p className="mt-1 text-sm text-foreground">
                    {new Date(user.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Último login</p>
                  <p className="mt-1 text-sm text-foreground">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleString('pt-BR')
                      : '—'}
                  </p>
                </div>
              </Stack>
            </CardContent>
            <CardFooter>
              <LogoutButton />
            </CardFooter>
          </Card>
        </Stack>
      </div>
    </div>
  );
}
