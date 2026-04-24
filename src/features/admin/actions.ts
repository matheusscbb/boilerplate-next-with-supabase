'use server';

import { createClient } from '@/infra/supabase/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function toggleUserActive(userId: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export async function assignStudentToTrainer(studentId: string, trainerId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ coach_id: trainerId })
    .eq('id', studentId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export async function createTrainerInvite(): Promise<{
  id: string;
  token: string;
  expires_at: string;
  url: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('generate_trainer_invite', {
    p_expires_hours: 168,
  });
  if (error) throw new Error(error.message);

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Convite não foi gerado.');

  const headersList = await headers();
  const host = headersList.get('host') ?? '';
  const proto = headersList.get('x-forwarded-proto') ?? 'https';
  const origin = `${proto}://${host}`;

  return {
    id: row.id,
    token: row.token,
    expires_at: row.expires_at,
    url: `${origin}/register?trainer_invite=${row.token}`,
  };
}
