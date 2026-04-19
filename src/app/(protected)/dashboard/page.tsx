import { createClient } from '@/infra/supabase/server';
import { Card, CardHeader, CardContent, Stack } from '@/design-system';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Stack gap="lg">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>Informações do usuário</CardHeader>
            <CardContent>
              <Stack gap="sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    ID
                  </p>
                  <p className="mt-1 break-all font-mono text-sm text-foreground">{user?.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-1 text-sm text-foreground">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Conta criada em
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Último login
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {user?.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleString('pt-BR')
                      : '—'}
                  </p>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </div>
      </Stack>
    </div>
  );
}
