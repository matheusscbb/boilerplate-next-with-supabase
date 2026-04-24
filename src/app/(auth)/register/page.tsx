import { RegisterForm } from '@/features/auth';
import { Stack } from '@/design-system';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  const inviteToken = isValidUuid(invite) ? invite : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Stack gap="lg">
          <h1 className="text-center text-2xl font-bold text-foreground">
            Criar conta
          </h1>
          <RegisterForm inviteToken={inviteToken} />
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
