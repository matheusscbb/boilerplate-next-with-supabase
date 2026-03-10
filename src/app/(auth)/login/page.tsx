import { LoginForm } from '@/features/auth';
import { Stack } from '@/design-system';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Stack gap="lg">
          <h1 className="text-center text-2xl font-bold text-foreground">
            Login
          </h1>
          <LoginForm />
        </Stack>
      </div>
    </div>
  );
}
