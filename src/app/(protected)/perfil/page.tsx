import { redirect } from 'next/navigation';
import { createClient } from '@/infra/supabase/server';
import { Card, Stack } from '@/design-system';
import type { UserRole } from '@/core/domain';
import { ProfileCard } from '@/features/profile/ProfileCard';

export const dynamic = 'force-dynamic';

interface ProfileRow {
  role: UserRole;
  full_name: string | null;
  coach_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Read-only profile page. Also doubles as a "signup validation" dashboard:
 * it exposes the live `profiles.role`, `coach_id`, and the raw
 * `user_metadata.role` stamped at signup so you can confirm the flow in one
 * glance after creating a test account.
 */
export default async function PerfilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, coach_id, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  const coachName = profile?.coach_id
    ? await fetchCoachName(supabase, profile.coach_id)
    : null;

  const studentCount =
    profile?.role === 'trainer'
      ? await fetchStudentCount(supabase, user.id)
      : null;

  const metadataRole =
    (user.user_metadata?.role as string | undefined) ?? null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Stack gap="lg">
        <header>
          <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informações da sua conta e do vínculo com a plataforma.
          </p>
        </header>

        <ProfileCard
          fullName={profile?.full_name ?? null}
          email={user.email ?? '—'}
          role={profile?.role ?? null}
          createdAt={formatDate(user.created_at)}
        />

        <Card>
          <Card.Header>Vínculo</Card.Header>
          <Card.Content>
            {profile?.role === 'trainer' ? (
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Alunos vinculados"
                  value={String(studentCount ?? 0)}
                />
                <Field
                  label="Convites de coach"
                  value="Gerar em /alunos"
                />
              </dl>
            ) : (
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Coach" value={coachName ?? 'Sem coach vinculado'} />
                <Field
                  label="ID do coach"
                  value={profile?.coach_id ?? '—'}
                />
              </dl>
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>Debug</Card.Header>
          <Card.Content>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="user.id" value={<code className="text-xs">{user.id}</code>} />
              <Field
                label="user_metadata.role"
                value={metadataRole ?? '—'}
              />
              <Field
                label="profile.role"
                value={profile?.role ?? 'Sem profile'}
              />
              <Field
                label="profile.updated_at"
                value={profile ? formatDate(profile.updated_at) : '—'}
              />
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Os dois primeiros campos acima são úteis para validar o fluxo
              de cadastro: ao criar uma conta como coach, ambos devem mostrar
              <code className="mx-1 rounded bg-muted px-1">trainer</code>. Se
              divergirem, a migration mais recente ainda não foi aplicada no
              banco.
            </p>
          </Card.Content>
        </Card>
      </Stack>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function fetchCoachName(
  supabase: Supabase,
  coachId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', coachId)
    .maybeSingle<{ full_name: string | null }>();
  return data?.full_name ?? null;
}

async function fetchStudentCount(
  supabase: Supabase,
  coachId: string
): Promise<number> {
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('coach_id', coachId);
  return count ?? 0;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

// ── Tiny presentational pieces ───────────────────────────────────────────

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}
