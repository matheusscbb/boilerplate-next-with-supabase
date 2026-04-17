'use client';

import { createClient } from '@/infra/supabase/client';

export function useSupabaseClient() {
  return createClient();
}
