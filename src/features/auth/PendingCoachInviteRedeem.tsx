'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/infra/supabase/client';

const PENDING_INVITE_KEY = 'pending_invite_token';

/**
 * After signup with email confirmation (no session yet), the invite token is
 * stored in localStorage. LoginForm redeems it, but if the user lands in a
 * protected route with a session from another path, we still run the RPC once.
 */
export function PendingCoachInviteRedeem() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || typeof window === 'undefined') return;
    const token = window.localStorage.getItem(PENDING_INVITE_KEY);
    if (!token) return;
    started.current = true;

    void (async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc('accept_coach_invite', {
        p_token: token,
      });
      if (!error) {
        window.localStorage.removeItem(PENDING_INVITE_KEY);
        router.refresh();
        return;
      }
      console.error('[PendingCoachInviteRedeem]', error);
      const msg = error.message ?? '';
      if (
        msg.includes('Invite invalid') ||
        msg.includes('expired') ||
        msg.includes('own invite')
      ) {
        window.localStorage.removeItem(PENDING_INVITE_KEY);
      }
    })();
  }, [router]);

  return null;
}
