'use server';

import { createClient } from '@/infra/supabase/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import type { TrainerInviteSummary } from './types';

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

export async function updateTrainerLicense(trainerId: string, expiresAt: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ license_expires_at: expiresAt })
    .eq('id', trainerId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

async function getOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') ?? '';
  const proto = headersList.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function listActiveTrainerInvites(): Promise<TrainerInviteSummary[]> {
  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase
    .from('trainer_invites')
    .select('id, token, created_at, expires_at')
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    token: row.token,
    url: `${origin}/register?trainer_invite=${row.token}`,
    created_at: row.created_at,
    expires_at: row.expires_at,
  }));
}

export async function createTrainerInvite(): Promise<TrainerInviteSummary> {
  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.rpc('generate_trainer_invite', {
    p_expires_hours: 168,
  });
  if (error) throw new Error(error.message);

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Convite não foi gerado.');

  return {
    id: row.id,
    token: row.token,
    url: `${origin}/register?trainer_invite=${row.token}`,
    created_at: new Date().toISOString(),
    expires_at: row.expires_at,
  };
}
