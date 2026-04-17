'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseAuthRepository } from '@/infra/supabase/SupabaseAuthRepository';
import { Button } from '@/design-system';

const authRepo = new SupabaseAuthRepository();

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    await authRepo.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <Button variant="secondary" isLoading={loading} fullWidth onClick={handleLogout}>
      Sair
    </Button>
  );
}
