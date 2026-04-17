'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/infra/supabase/client';
import { Button, Input, Card, Stack } from '@/design-system';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Card.Header>Entrar</Card.Header>
        <Card.Content>
          <Stack gap="md">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </Stack>
        </Card.Content>
        <Card.Footer>
          <Button type="submit" isLoading={loading} fullWidth>
            Entrar
          </Button>
        </Card.Footer>
      </form>
    </Card>
  );
}
