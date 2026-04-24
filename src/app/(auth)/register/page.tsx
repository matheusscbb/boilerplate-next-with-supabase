import { RegisterForm } from '@/features/auth';
import { Stack } from '@/design-system';
import Link from 'next/link';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; trainer_invite?: string }>;
}) {
  const { invite, trainer_invite } = await searchParams;
  const inviteToken = isValidUuid(invite) ? invite : undefined;
  const trainerInviteToken = isValidUuid(trainer_invite) ? trainer_invite : undefined;

  // Block self-registration: require a valid invite token of either type.
  if (!inviteToken && !trainerInviteToken) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Stack gap="md">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-destructive"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Cadastro apenas por convite
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Para criar uma conta, você precisa de um link de convite enviado
                pelo seu treinador ou pelo administrador do sistema.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Ir para o login
            </Link>
          </Stack>
        </div>
      </div>
    );
  }

  const title = trainerInviteToken
    ? 'Cadastro de Treinador'
    : 'Criar conta';

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Stack gap="lg">
          <h1 className="text-center text-2xl font-bold text-foreground">
            {title}
          </h1>
          <RegisterForm
            inviteToken={inviteToken}
            trainerInviteToken={trainerInviteToken}
          />
        </Stack>
      </div>
    </div>
  );
}

function isValidUuid(v: unknown): v is string {
  return (
    typeof v === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
  );
}
