'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/infra/supabase/client';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = createClient();

    const fetchUser = async () => {
      const { data: { user: currentUser } } = await client.auth.getUser();
      setUser(currentUser ?? null);
      setLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = client.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
