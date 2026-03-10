'use client';

import { createClient } from '@/lib/supabase/client';

export function useSupabaseClient() {
  return createClient();
}
